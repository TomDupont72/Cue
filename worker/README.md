# worker

## Getting started

### Installing dependencies

The worker requires Python 3.12, 3.13, or 3.14.

**Option 1: uv**

Ensure [`uv`](https://docs.astral.sh/uv/) is installed following their [official documentation](https://docs.astral.sh/uv/getting-started/installation/).

Create a virtual environment, and install the required dependencies using _sync_:

```bash
uv sync
```

Then, activate the virtual environment:

| OS | Command |
| --- | --- |
| MacOS | ```source .venv/bin/activate``` |
| Windows | ```.venv\Scripts\activate``` |

**Option 2: pip**

Install the python dependencies with [pip](https://pypi.org/project/pip/):

```bash
python3 -m venv .venv
```

Then activate the virtual environment:

| OS | Command |
| --- | --- |
| MacOS | ```source .venv/bin/activate``` |
| Windows | ```.venv\Scripts\activate``` |

Install the required dependencies:

```bash
pip install -e ".[dev]"
```

### Running Dagster

Start the Dagster UI web server:

```bash
dg dev
```

Open http://localhost:3000 in your browser to see the project.

### Synchronization recovery

The daily 03:00 Europe/Paris run resumes from the scheduled execution time of the
latest successful synchronization run stored by Dagster. Failed runs do not advance
that watermark; the next run replays the missing dates in an idempotent window of
at most 14 days. A longer interruption triggers an immediate full reconciliation,
as does the first run. A full reconciliation also runs every Sunday at 04:00.

An isolated series failure is retried inside its batch and then recorded in the
successful run's persistent retry queue, so it is attempted again on later runs
without blocking unrelated series or the watermark. The queue is capped at 500
identifiers; a larger, likely systemic failure keeps the run failed and leaves the
watermark unchanged.

Keep `DAGSTER_STORAGE_DIR` on persistent storage shared by the webserver and daemon.
The supplied Compose configurations already mount that directory. Dagster limits
these synchronization jobs to one concurrent run, while series batches use up to
four worker processes.

### Running tests

Run the worker contract tests from this directory:

```bash
python -m unittest discover -s src/tests -p "test_*.py"
```

## Learn more

To learn more about this template and Dagster in general:

- [Dagster Documentation](https://docs.dagster.io/)
- [Dagster University](https://courses.dagster.io/)
- [Dagster Slack Community](https://dagster.io/slack)
