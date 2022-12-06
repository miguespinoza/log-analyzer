import { Button } from "./Button";
import { LabeledTextField } from "./LabeledTextField";
import { withModal } from "./withModal";
import * as Sentry from "@sentry/browser";

export const FeedbackForm = ({
  exception,
  onComplete,
}: {
  exception?: Error;
  onComplete: () => void;
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
            if (feedback)
              exception.message =
                exception.message + "USER_Fedback: " + feedback;
            Sentry.captureException(exception);
          } else if (feedback) {
            Sentry.captureMessage(feedback);
          }
          onComplete();
        }}
      >
        <span className="text-lg text-red font-bold">
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
        <Button look="primary">Send</Button>
      </form>
    </div>
  );
};

export const FeedbackFormModal = withModal(FeedbackForm);
