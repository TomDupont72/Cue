import datetime
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, PropertyMock, call, patch
from zoneinfo import ZoneInfo

import dagster as dg
import yaml

from orchestrator.jobs.sync_series import (
    API_RETRY_POLICY,
    FAILED_SERIES_IDS_TAG,
    FULL_RECONCILIATION_MODE,
    IMPORT_BATCH_SIZE,
    INCREMENTAL_MODE,
    MAX_QUEUED_FAILURE_IDS,
    SCHEDULED_EXECUTION_TIME_TAG,
    STATUS_RECALC_FAILED_TAG,
    SYNC_MODE_TAG,
    SYNC_RUN_TAG,
    TMDB_MAX_WINDOW_DAYS,
    ChangeWindow,
    SyncBatchResult,
    SyncRunState,
    _get_changed_series_ids,
    _parse_scheduled_execution_time,
    build_change_windows,
    change_feed_retention_exceeded,
    discover_series,
    latest_successful_watermark,
    latest_successful_sync_state,
    reconcile_all_series_schedule,
    sync_all_series_job,
    sync_series_batch,
    sync_series_schedule,
    update_user_statuses,
)


class WatermarkTests(unittest.TestCase):
    def setUp(self) -> None:
        self.instance = dg.DagsterInstance.ephemeral()
        self.addCleanup(self.instance.dispose)

    def _add_run(
        self,
        *,
        status: dg.DagsterRunStatus,
        mode: str,
        tagged_time: str | None,
        failed_series_ids: str | None = None,
    ) -> None:
        config_time = "2026-08-01T03:00:00+02:00"
        tags = {SYNC_MODE_TAG: mode}
        if tagged_time is not None:
            tags[SCHEDULED_EXECUTION_TIME_TAG] = tagged_time
        if failed_series_ids is not None:
            tags[FAILED_SERIES_IDS_TAG] = failed_series_ids

        self.instance.create_run_for_job(
            sync_all_series_job,
            status=status,
            tags=tags,
            run_config={
                "ops": {
                    "discover_series": {
                        "config": {
                            "scheduled_execution_time": config_time,
                            "full_reconciliation": mode
                            == FULL_RECONCILIATION_MODE,
                        }
                    }
                }
            },
        )

    def test_latest_state_uses_successful_incremental_or_full_runs(self) -> None:
        self.assertIsNone(
            latest_successful_watermark(self.instance, sync_all_series_job.name)
        )

        self._add_run(
            status=dg.DagsterRunStatus.SUCCESS,
            mode=INCREMENTAL_MODE,
            tagged_time="2026-08-02T03:00:00+02:00",
        )
        self._add_run(
            status=dg.DagsterRunStatus.SUCCESS,
            mode=INCREMENTAL_MODE,
            tagged_time="not-a-date",
        )
        self._add_run(
            status=dg.DagsterRunStatus.SUCCESS,
            mode=INCREMENTAL_MODE,
            tagged_time=None,
        )
        self._add_run(
            status=dg.DagsterRunStatus.SUCCESS,
            mode=FULL_RECONCILIATION_MODE,
            tagged_time="2026-08-20T04:00:00+02:00",
            failed_series_ids="[42,84]",
        )
        self._add_run(
            status=dg.DagsterRunStatus.FAILURE,
            mode=INCREMENTAL_MODE,
            tagged_time="2026-08-21T03:00:00+02:00",
        )
        self._add_run(
            status=dg.DagsterRunStatus.SUCCESS,
            mode=INCREMENTAL_MODE,
            tagged_time="2026-08-05T03:00:00+02:00",
        )

        expected_watermark = datetime.datetime.fromisoformat(
            "2026-08-20T04:00:00+02:00"
        )
        self.assertEqual(
            latest_successful_watermark(self.instance, sync_all_series_job.name),
            expected_watermark,
        )
        self.assertEqual(
            latest_successful_sync_state(self.instance, sync_all_series_job.name),
            SyncRunState(expected_watermark, frozenset({42, 84})),
        )

    def test_scheduled_time_parser_requires_a_timezone_and_accepts_z(self) -> None:
        self.assertEqual(
            _parse_scheduled_execution_time("2026-08-10T01:00:00Z"),
            datetime.datetime(2026, 8, 10, 1, tzinfo=datetime.timezone.utc),
        )

        with self.assertRaisesRegex(ValueError, "must include a timezone"):
            _parse_scheduled_execution_time("2026-08-10T03:00:00")


class ChangeWindowTests(unittest.TestCase):
    def test_long_outage_is_split_without_gaps_into_fourteen_day_windows(self) -> None:
        timezone = ZoneInfo("Europe/Paris")
        watermark = datetime.datetime(2026, 8, 1, 3, tzinfo=timezone)
        scheduled_time = datetime.datetime(2026, 9, 2, 3, tzinfo=timezone)

        windows = build_change_windows(watermark, scheduled_time)

        self.assertEqual(
            windows,
            [
                ChangeWindow(datetime.date(2026, 8, 1), datetime.date(2026, 8, 14)),
                ChangeWindow(datetime.date(2026, 8, 15), datetime.date(2026, 8, 28)),
                ChangeWindow(datetime.date(2026, 8, 29), datetime.date(2026, 9, 2)),
            ],
        )
        self.assertTrue(
            all(
                (window.end_date - window.start_date).days + 1
                <= TMDB_MAX_WINDOW_DAYS
                for window in windows
            )
        )
        for previous, current in zip(windows, windows[1:]):
            self.assertEqual(
                current.start_date,
                previous.end_date + datetime.timedelta(days=1),
            )

    def test_window_starts_on_watermark_day_in_schedule_timezone(self) -> None:
        watermark = datetime.datetime(
            2026,
            3,
            28,
            23,
            30,
            tzinfo=datetime.timezone.utc,
        )
        scheduled_time = datetime.datetime(
            2026,
            3,
            29,
            3,
            tzinfo=ZoneInfo("Europe/Paris"),
        )

        self.assertEqual(
            build_change_windows(watermark, scheduled_time),
            [ChangeWindow(datetime.date(2026, 3, 29), datetime.date(2026, 3, 29))],
        )

    def test_windows_reject_naive_datetimes(self) -> None:
        aware = datetime.datetime(2026, 8, 10, 3, tzinfo=datetime.timezone.utc)

        with self.assertRaisesRegex(ValueError, "watermark must include a timezone"):
            build_change_windows(datetime.datetime(2026, 8, 9, 3), aware)

        with self.assertRaisesRegex(
            ValueError,
            "scheduled_execution_time must include a timezone",
        ):
            build_change_windows(aware, datetime.datetime(2026, 8, 10, 3))

    def test_change_feed_retention_boundary_is_fourteen_calendar_days(self) -> None:
        timezone = ZoneInfo("Europe/Paris")
        scheduled_time = datetime.datetime(2026, 8, 14, 3, tzinfo=timezone)

        self.assertFalse(
            change_feed_retention_exceeded(
                datetime.datetime(2026, 8, 1, 3, tzinfo=timezone),
                scheduled_time,
                current_time=scheduled_time,
            )
        )
        self.assertTrue(
            change_feed_retention_exceeded(
                datetime.datetime(2026, 7, 31, 3, tzinfo=timezone),
                scheduled_time,
                current_time=scheduled_time,
            )
        )

    def test_old_queued_run_falls_back_to_full_using_actual_execution_time(self) -> None:
        timezone = ZoneInfo("Europe/Paris")

        self.assertTrue(
            change_feed_retention_exceeded(
                datetime.datetime(2026, 8, 9, 3, tzinfo=timezone),
                datetime.datetime(2026, 8, 10, 3, tzinfo=timezone),
                current_time=datetime.datetime(
                    2026,
                    8,
                    25,
                    1,
                    tzinfo=datetime.timezone.utc,
                ),
            )
        )


class DiscoveryTests(unittest.TestCase):
    def test_first_incremental_run_reconciles_every_stored_series_in_batches(self) -> None:
        database = Mock()
        cue_api = Mock()
        stored_ids = set(range(45, 0, -1))

        with (
            patch(
                "orchestrator.jobs.sync_series._get_all_series_ids",
                return_value=stored_ids,
            ),
            patch(
                "orchestrator.jobs.sync_series.latest_successful_sync_state",
                return_value=None,
            ),
            patch(
                "orchestrator.jobs.sync_series._get_changed_series_ids"
            ) as get_changed,
            dg.build_op_context(
                resources={"database": database, "cue_api": cue_api},
                op_config={
                    "scheduled_execution_time": "2026-08-10T03:00:00+02:00",
                    "full_reconciliation": False,
                },
            ) as context,
        ):
            with patch.object(
                type(context),
                "job_name",
                new_callable=PropertyMock,
                return_value=sync_all_series_job.name,
            ):
                outputs = list(discover_series(context))

        get_changed.assert_not_called()
        self.assertEqual(
            [output.mapping_key for output in outputs],
            ["batch_00000", "batch_00001", "batch_00002"],
        )
        self.assertEqual(
            [len(output.value) for output in outputs],
            [IMPORT_BATCH_SIZE, IMPORT_BATCH_SIZE, 5],
        )
        self.assertEqual(
            [tmdb_id for output in outputs for tmdb_id in output.value],
            list(range(1, 46)),
        )

    def test_outage_beyond_tmdb_retention_forces_a_full_reconciliation(self) -> None:
        database = Mock()
        cue_api = Mock()
        state = SyncRunState(
            watermark=datetime.datetime.fromisoformat("2026-07-01T03:00:00+02:00"),
            failed_series_ids=frozenset({2}),
        )

        with (
            patch(
                "orchestrator.jobs.sync_series._get_all_series_ids",
                return_value={1, 2, 3},
            ),
            patch(
                "orchestrator.jobs.sync_series.latest_successful_sync_state",
                return_value=state,
            ),
            patch(
                "orchestrator.jobs.sync_series._get_changed_series_ids"
            ) as get_changed,
            dg.build_op_context(
                resources={"database": database, "cue_api": cue_api},
                op_config={
                    "scheduled_execution_time": "2026-08-10T03:00:00+02:00",
                    "full_reconciliation": False,
                },
            ) as context,
        ):
            with patch.object(
                type(context),
                "job_name",
                new_callable=PropertyMock,
                return_value=sync_all_series_job.name,
            ):
                outputs = list(discover_series(context))

        get_changed.assert_not_called()
        self.assertEqual(outputs[0].value, [1, 2, 3])

    def test_isolated_failures_are_retried_with_the_next_incremental_window(
        self,
    ) -> None:
        state = SyncRunState(
            watermark=datetime.datetime.fromisoformat("2026-08-09T03:00:00+02:00"),
            failed_series_ids=frozenset({3}),
        )

        with (
            patch(
                "orchestrator.jobs.sync_series._get_all_series_ids",
                return_value={1, 2, 3},
            ),
            patch(
                "orchestrator.jobs.sync_series.latest_successful_sync_state",
                return_value=state,
            ),
            patch(
                "orchestrator.jobs.sync_series._get_changed_series_ids",
                return_value={1},
            ),
            dg.build_op_context(
                resources={"database": Mock(), "cue_api": Mock()},
                op_config={
                    "scheduled_execution_time": "2026-08-10T03:00:00+02:00",
                    "full_reconciliation": False,
                },
            ) as context,
        ):
            with patch.object(
                type(context),
                "job_name",
                new_callable=PropertyMock,
                return_value=sync_all_series_job.name,
            ):
                outputs = list(discover_series(context))

        self.assertEqual(outputs[0].value, [1, 3])

    def test_changed_ids_are_deduplicated_across_pages_and_windows(self) -> None:
        cue_api = Mock()
        cue_api.get_series_changes.side_effect = [
            SimpleNamespace(
                results=[SimpleNamespace(tmdb_id=1), SimpleNamespace(tmdb_id=2)],
                total_pages=2,
                total_results=3,
            ),
            SimpleNamespace(
                results=[SimpleNamespace(tmdb_id=2)],
                total_pages=2,
                total_results=3,
            ),
            SimpleNamespace(
                results=[SimpleNamespace(tmdb_id=1), SimpleNamespace(tmdb_id=3)],
                total_pages=1,
                total_results=2,
            ),
        ]
        windows = [
            ChangeWindow(datetime.date(2026, 8, 1), datetime.date(2026, 8, 14)),
            ChangeWindow(datetime.date(2026, 8, 15), datetime.date(2026, 8, 20)),
        ]

        with dg.build_op_context() as context:
            changed_ids = _get_changed_series_ids(context, cue_api, windows)

        self.assertEqual(changed_ids, {1, 2, 3})
        self.assertEqual(
            cue_api.get_series_changes.call_args_list,
            [
                call(datetime.date(2026, 8, 1), datetime.date(2026, 8, 14), 1),
                call(datetime.date(2026, 8, 1), datetime.date(2026, 8, 14), 2),
                call(datetime.date(2026, 8, 15), datetime.date(2026, 8, 20), 1),
            ],
        )


class ScheduleTests(unittest.TestCase):
    def _evaluate(
        self,
        schedule: dg.ScheduleDefinition,
        scheduled_time: datetime.datetime,
    ) -> dg.RunRequest:
        with dg.build_schedule_context(
            scheduled_execution_time=scheduled_time
        ) as context:
            execution_data = schedule.evaluate_tick(context)

        self.assertEqual(len(execution_data.run_requests), 1)
        return execution_data.run_requests[0]

    def test_incremental_schedule_passes_exact_scheduled_time_and_tags(self) -> None:
        scheduled_time = datetime.datetime(
            2026,
            8,
            10,
            3,
            tzinfo=ZoneInfo("Europe/Paris"),
        )
        scheduled_value = scheduled_time.isoformat()

        request = self._evaluate(sync_series_schedule, scheduled_time)

        self.assertEqual(
            request.run_key,
            f"sync-series:{INCREMENTAL_MODE}:{scheduled_value}",
        )
        self.assertEqual(request.tags[SYNC_RUN_TAG], "true")
        self.assertEqual(request.tags[SYNC_MODE_TAG], INCREMENTAL_MODE)
        self.assertEqual(
            request.tags[SCHEDULED_EXECUTION_TIME_TAG],
            scheduled_value,
        )
        self.assertEqual(
            request.run_config["ops"]["discover_series"]["config"],
            {
                "scheduled_execution_time": scheduled_value,
                "full_reconciliation": False,
            },
        )
        self.assertEqual(sync_series_schedule.cron_schedule, "0 3 * * *")
        self.assertEqual(sync_series_schedule.execution_timezone, "Europe/Paris")

    def test_weekly_schedule_requests_full_reconciliation(self) -> None:
        scheduled_time = datetime.datetime(
            2026,
            8,
            9,
            4,
            tzinfo=ZoneInfo("Europe/Paris"),
        )
        scheduled_value = scheduled_time.isoformat()

        request = self._evaluate(reconcile_all_series_schedule, scheduled_time)

        self.assertEqual(
            request.run_key,
            f"sync-series:{FULL_RECONCILIATION_MODE}:{scheduled_value}",
        )
        self.assertEqual(request.tags[SYNC_MODE_TAG], FULL_RECONCILIATION_MODE)
        self.assertTrue(
            request.run_config["ops"]["discover_series"]["config"][
                "full_reconciliation"
            ]
        )
        self.assertEqual(reconcile_all_series_schedule.cron_schedule, "0 4 * * 0")
        self.assertEqual(
            reconcile_all_series_schedule.execution_timezone,
            "Europe/Paris",
        )


class OrchestrationTests(unittest.TestCase):
    def test_batch_retries_then_isolates_failures_after_attempting_every_series(
        self,
    ) -> None:
        cue_api = Mock()

        def import_series(tmdb_id: int) -> object:
            if tmdb_id in {2, 4}:
                raise RuntimeError(f"TMDB {tmdb_id} unavailable")
            return object()

        cue_api.post_user_series_import.side_effect = import_series

        with (
            dg.build_op_context(resources={"cue_api": cue_api}) as context,
            patch("orchestrator.jobs.sync_series._retry_number", return_value=0),
        ):
            with self.assertRaisesRegex(
                RuntimeError,
                r"Échec de 2 import\(s\) TMDB dans le batch : 2, 4",
            ):
                sync_series_batch(context, tmdb_ids=[1, 2, 3, 4, 5])

        self.assertEqual(
            cue_api.post_user_series_import.call_args_list,
            [call(1), call(2), call(3), call(4), call(5)],
        )

        cue_api.reset_mock()
        cue_api.post_user_series_import.side_effect = import_series
        with dg.build_op_context(resources={"cue_api": cue_api}) as context:
            result = sync_series_batch(context, tmdb_ids=[1, 2, 3, 4, 5])

        self.assertEqual(result.synced_ids, (1, 3, 5))
        self.assertEqual(result.failed_ids, (2, 4))
        self.assertEqual(
            cue_api.post_user_series_import.call_args_list,
            [call(1), call(2), call(3), call(4), call(5)],
        )

    def test_statuses_are_recalculated_in_one_global_call(self) -> None:
        cue_api = Mock()
        cue_api.post_user_statuses_recalculate.return_value = SimpleNamespace(
            updated_count=3
        )

        with dg.build_op_context(resources={"cue_api": cue_api}) as context:
            with patch.object(context.instance, "add_run_tags") as add_run_tags:
                update_user_statuses(
                    context,
                    synced_batches=[
                        SyncBatchResult(synced_ids=(1, 2), failed_ids=()),
                        SyncBatchResult(synced_ids=(3,), failed_ids=(4,)),
                    ],
                )

        cue_api.post_user_statuses_recalculate.assert_called_once_with()
        cue_api.post_user_status_recalculate.assert_not_called()
        add_run_tags.assert_called_once_with(
            context.run_id,
            {
                FAILED_SERIES_IDS_TAG: "[4]",
                STATUS_RECALC_FAILED_TAG: "false",
            },
        )

    def test_status_recalculation_retries_then_isolates_a_final_failure(self) -> None:
        cue_api = Mock()
        cue_api.post_user_statuses_recalculate.side_effect = RuntimeError(
            "status API unavailable"
        )

        with dg.build_op_context(resources={"cue_api": cue_api}) as context:
            with (
                patch.object(context.instance, "add_run_tags") as add_run_tags,
                patch("orchestrator.jobs.sync_series._retry_number", return_value=0),
                self.assertRaisesRegex(RuntimeError, "status API unavailable"),
            ):
                update_user_statuses(context, synced_batches=[])
            add_run_tags.assert_not_called()

        cue_api.reset_mock()
        cue_api.post_user_statuses_recalculate.side_effect = RuntimeError(
            "status API unavailable"
        )
        with dg.build_op_context(resources={"cue_api": cue_api}) as context:
            with patch.object(context.instance, "add_run_tags") as add_run_tags:
                update_user_statuses(context, synced_batches=[])

        add_run_tags.assert_called_once_with(
            context.run_id,
            {
                FAILED_SERIES_IDS_TAG: "[]",
                STATUS_RECALC_FAILED_TAG: "true",
            },
        )

    def test_oversized_failure_queue_keeps_the_watermark_unchanged(self) -> None:
        cue_api = Mock()
        failed_ids = tuple(range(1, MAX_QUEUED_FAILURE_IDS + 2))

        with dg.build_op_context(resources={"cue_api": cue_api}) as context:
            with (
                patch.object(context.instance, "add_run_tags") as add_run_tags,
                self.assertRaisesRegex(RuntimeError, "watermark reste inchangé"),
            ):
                update_user_statuses(
                    context,
                    synced_batches=[
                        SyncBatchResult(synced_ids=(), failed_ids=failed_ids)
                    ],
                )

        cue_api.post_user_statuses_recalculate.assert_not_called()
        add_run_tags.assert_not_called()

    def test_retry_policies_and_dynamic_mapping_are_attached(self) -> None:
        for op_definition in (
            discover_series,
            sync_series_batch,
            update_user_statuses,
        ):
            with self.subTest(op=op_definition.name):
                self.assertEqual(op_definition.retry_policy, API_RETRY_POLICY)

        self.assertEqual(API_RETRY_POLICY.max_retries, 2)
        self.assertEqual(API_RETRY_POLICY.backoff, dg.Backoff.EXPONENTIAL)
        self.assertEqual(API_RETRY_POLICY.jitter, dg.Jitter.PLUS_MINUS)
        self.assertEqual(sync_all_series_job.executor_def.name, "sync_series_executor")
        self.assertEqual(sync_all_series_job.run_tags[SYNC_RUN_TAG], "true")

        graph = sync_all_series_job.graph
        dependencies = graph.dependency_structure
        self.assertTrue(discover_series.output_defs[0].is_dynamic)
        self.assertTrue(dependencies.has_dynamic_downstreams("discover_series"))
        self.assertTrue(dependencies.is_dynamic_mapped("sync_series_batch"))
        upstream = dependencies.get_upstream_dynamic_output_for_node(
            "sync_series_batch"
        )
        self.assertIsNotNone(upstream)
        assert upstream is not None
        self.assertEqual(upstream.node_name, "discover_series")

        update_input = next(iter(graph.node_dict["update_user_statuses"].inputs()))
        self.assertTrue(dependencies.has_dynamic_fan_in_dep(update_input))
        collected = dependencies.get_dynamic_fan_in_dep(update_input)
        self.assertEqual(collected.node_name, "sync_series_batch")

    def test_dagster_limits_sync_runs_to_one_for_the_shared_run_tag(self) -> None:
        dagster_config = yaml.safe_load(
            (Path(__file__).resolve().parents[2] / "dagster.yaml").read_text(
                encoding="utf-8"
            )
        )

        self.assertIn(
            {
                "key": SYNC_RUN_TAG,
                "value": "true",
                "limit": 1,
            },
            dagster_config["concurrency"]["runs"]["tag_concurrency_limits"],
        )


if __name__ == "__main__":
    unittest.main()
