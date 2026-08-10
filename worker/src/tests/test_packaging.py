import tomllib
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]


class PackagingConfigurationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        with (PROJECT_ROOT / "pyproject.toml").open("rb") as pyproject_file:
            cls.pyproject = tomllib.load(pyproject_file)

        with (PROJECT_ROOT / "uv.lock").open("rb") as lock_file:
            cls.lock = tomllib.load(lock_file)

    def test_wheel_packages_orchestrator(self) -> None:
        wheel = self.pyproject["tool"]["hatch"]["build"]["targets"]["wheel"]

        self.assertEqual(wheel["packages"], ["src/orchestrator"])
        self.assertTrue((PROJECT_ROOT / "src" / "orchestrator" / "__init__.py").is_file())

    def test_project_version_matches_lock(self) -> None:
        project = self.pyproject["project"]
        locked_worker = [
            package
            for package in self.lock["package"]
            if package["name"] == project["name"]
        ]

        self.assertEqual(len(locked_worker), 1)
        self.assertEqual(locked_worker[0]["version"], project["version"])

    def test_python_compatibility_matches_lock(self) -> None:
        project_requires_python = self.pyproject["project"]["requires-python"]
        lock_requires_python = self.lock["requires-python"]

        self.assertEqual(
            lock_requires_python.replace(" ", ""),
            project_requires_python.replace(" ", ""),
        )

    def test_documented_dev_extra_exists(self) -> None:
        optional_dependencies = self.pyproject["project"]["optional-dependencies"]

        self.assertIn("dev", optional_dependencies)
        self.assertIn("dagster-dg-cli", optional_dependencies["dev"])


if __name__ == "__main__":
    unittest.main()
