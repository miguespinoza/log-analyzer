import { Button } from "./Button";
import { LabeledTextField } from "./LabeledTextField";
import { withModal } from "./withModal";
import * as Sentry from "@sentry/browser";

export const FeedbackForm = ({
  exception,
  onComplete,
  title,
  onCancel,
}: {
  exception?: Error;
  title?: string;
  onComplete: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="dark:bg-[#011627] p-2 rounded">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // capture exception
          //const exc = exception != null ? exception : new Error();

          const form = e.target as HTMLFormElement;
          const data = new FormData(form);
          const feedback = data.get("feedback") as string | undefined;
          if (exception) {
            Sentry.captureException(exception);
          }
          if (feedback) {
            Sentry.captureMessage(feedback);
          }
          onComplete();
        }}
        className="flex flex-col gap-1"
      >
        <span className="text-lg font-bold">{title ? title : "Feedback"}</span>
        <span className="text-lg text-red-700">
          Important!: Don't include sentitive information in feedback
        </span>
        <LabeledTextField
          label="Feedback"
          inputProps={{
            autoFocus: true,
            name: "feedback",
            type: "text",
            className: "w-full",
          }}
        />
        <div className="flex justify-between">
          <Button onClick={onCancel} look="secondary" type="button">
            Cancel
          </Button>
          <Button look="primary" type="submit">
            Send Feedback
          </Button>
        </div>
      </form>
    </div>
  );
};

export const FeedbackFormModal = withModal(FeedbackForm);
