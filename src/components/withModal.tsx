import clsx from "clsx";
import ReactModal from "react-modal";
import { useThemeActions } from "./useThemeActions";

export function withModal<PropTypes>(Component: React.FC<PropTypes>) {
  const WithModal: React.FC<{
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    forwardProps?: PropTypes;
  }> = (props) => {
    const { getTheme } = useThemeActions();
    return (
      <ReactModal
        isOpen={props.showModal}
        onRequestClose={() => props.setShowModal(false)}
        className={clsx(
          "bg-white dark:bg-gray-800 Modal  border rounded dark:border-cyan-800",
          getTheme() === "dark" ? "dark" : ""
        )}
        overlayClassName="Overlay "
        shouldCloseOnOverlayClick={true}
      >
        <Component {...(props.forwardProps as any)} />
      </ReactModal>
    );
  };
  return WithModal;
}
