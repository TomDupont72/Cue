import { Formatter, Status, formatterHelpers } from "@cucumber/cucumber";

const stepIcon = {
  [Status.PASSED]: ".",
  [Status.FAILED]: "F",
  [Status.AMBIGUOUS]: "A",
  [Status.PENDING]: "P",
  [Status.SKIPPED]: "-",
  [Status.UNDEFINED]: "U",
  [Status.UNKNOWN]: "?"
};

const issueIcon = {
  [Status.PASSED]: "✔",
  [Status.FAILED]: "✘",
  [Status.AMBIGUOUS]: "✘",
  [Status.PENDING]: "?",
  [Status.SKIPPED]: "-",
  [Status.UNDEFINED]: "?"
};

export default class FileProgressFormatter extends Formatter {
  constructor(options) {
    super(options);

    this.currentFile = null;
    this.scenarios = [];
    this.failures = [];
    this.warnings = [];

    options.eventBroadcaster.on("envelope", (envelope) => {
      if (envelope.testCaseStarted) {
        const attempt = this.eventDataCollector.getTestCaseAttempt(envelope.testCaseStarted.id);
        this.printFile(attempt.pickle.uri);
      }

      if (envelope.testStepFinished) {
        const { status } = envelope.testStepFinished.testStepResult;
        this.log(this.colorFns.forStatus(status)(stepIcon[status] ?? "?"));
      }

      if (envelope.testCaseFinished) {
        const attempt = this.eventDataCollector.getTestCaseAttempt(
          envelope.testCaseFinished.testCaseStartedId
        );

        if (!attempt.willBeRetried) {
          const result = attempt.worstTestStepResult;
          this.scenarios.push(result.status);

          if (formatterHelpers.isFailure(result)) {
            this.failures.push(attempt);
          } else if (formatterHelpers.isWarning(result)) {
            this.warnings.push(attempt);
          }
        }
      }
    });
  }

  printFile(file) {
    if (file !== this.currentFile) {
      this.finishFile();
      this.log(`\n${file} `);
      this.currentFile = file;
    }
  }

  finishFile() {
    if (this.currentFile === null) {
      return;
    }

    this.log("\n");
    this.currentFile = null;
  }

  printIssues(title, issues) {
    if (issues.length === 0) {
      return;
    }

    const colorFns = {
      ...this.colorFns,
      forStatus: (status) => {
        const colorize = this.colorFns.forStatus(status);
        let firstCall = true;

        return (text) => {
          if (!firstCall) {
            return colorize(text);
          }

          firstCall = false;
          const prefix = `${issueIcon[status]} `;
          return colorize(text.startsWith(prefix) ? text.slice(prefix.length) : text);
        };
      }
    };

    this.log(`${title}:\n\n`);

    issues.forEach((attempt, index) => {
      this.log(
        formatterHelpers.formatIssue({
          colorFns,
          number: index + 1,
          snippetBuilder: this.snippetBuilder,
          testCaseAttempt: attempt,
          supportCodeLibrary: this.supportCodeLibrary,
          printAttachments: this.printAttachments
        })
      );
      this.log("\n");
    });
  }

  async finished() {
    this.finishFile();
    this.log("\n");
    this.printIssues("Failures", this.failures);
    this.printIssues("Warnings", this.warnings);

    const passed = this.scenarios.filter((status) => status === Status.PASSED).length;
    const skipped = this.scenarios.filter((status) => status === Status.SKIPPED).length;
    const failed = this.scenarios.length - passed - skipped;
    const total = this.scenarios.length;
    const summary = [this.colorFns.forStatus(Status.PASSED)(`${passed} passed`)];

    if (failed > 0) {
      summary.push(this.colorFns.forStatus(Status.FAILED)(`${failed} failed`));
    }
    if (skipped > 0) {
      summary.push(this.colorFns.forStatus(Status.SKIPPED)(`${skipped} skipped`));
    }

    this.log(`Summary: ${total} scenario${total === 1 ? "" : "s"} (${summary.join(", ")})\n`);

    await super.finished();
  }
}
