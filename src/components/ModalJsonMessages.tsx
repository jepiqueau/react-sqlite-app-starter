import React, { useState } from 'react';
import './ModalJsonMessages.css';
import Modal, { Styles } from 'react-modal';

interface ModalProps {
    message: string;
    close: any;
}
  
const ModalJsonMessages: React.FC<ModalProps> = (props) => {
    const [modalIsOpen,setModalIsOpen] = useState(true);

    const setModalIsOpenToFalse = () => {
        setModalIsOpen(false);
        props.close();
    }
    const customStyles: Styles = {
        content : {
          top                   : '10%',
          left                  : '2%',
          right                 : '2%',
          bottom                : '10%',
          backgroundColor       : '#D3D3D3',
          borderRadius          : '25px' ,
          whiteSpace            : 'pre-wrap',
          overflowWrap          : 'break-word' ,
          wordWrap              : 'break-word',
          hyphens               : 'auto',
        }
    };
    return (
        <Modal isOpen={modalIsOpen} style={customStyles} ariaHideApp={false}>
            <button className="button" onClick={setModalIsOpenToFalse}>Close</button>
            <pre>
                <p className="message">{props.message}</p>
            </pre>
        </Modal>
    );

};
export default ModalJsonMessages;
