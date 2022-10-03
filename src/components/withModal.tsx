import ReactModal from "react-modal";

export const withModal =
  (children: React.ReactNode) =>
  ({
    showModal,
    setShowModal,
  }: {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
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
        {children}
      </ReactModal>
    );
  };
