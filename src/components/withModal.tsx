import ReactModal from "react-modal";



export function withModal<T>(Component: React.FunctionComponent<T>) {
  return ({
    showModal,
    setShowModal,
    forwardProps,
  }: {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    forwardProps: T;
  }) => {
    return (
      <ReactModal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
          },
        }}
        shouldCloseOnOverlayClick={true}
      >
        <Component {...(forwardProps as any)} />
      </ReactModal>
    );
  };
}
