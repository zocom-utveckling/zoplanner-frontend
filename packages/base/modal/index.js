// Publika exporter för @zoplanner/modal.
//
// Compound-komponent som ersätter den tidigare ModalOverlay i
// @zoplanner/activity-creation. Användning:
//
//   <Modal onClose={...} closeOnEscape>
//     <Modal.Content role="dialog" ariaLabel="Detaljer">
//       ...innehåll...
//     </Modal.Content>
//   </Modal>
//
// Modaler som vill rendera sin egen innehållsruta (t.ex. RequestActivityModal)
// hoppar över <Modal.Content> och lägger barnet direkt under <Modal>.

export { default as Modal } from "./ui/Modal";
