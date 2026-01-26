import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import "./_PopupModal.css";

export default function PopupModal({close, headerText, body}) {
    return (
        <Popup open={true} closeOnDocumentClick onClose={close}>
            <div className="text-lg p-1">
                <a className="cursor-pointer absolute block py-[2px] px-[5px] leading-5 -right-2 -top-2 text-2xl bg-white rounded-2xl border border-solid" onClick={close}>
                    &times;
                </a>
                {headerText !== "" && headerText !== null && (
                    <div className="mx-auto border-b border-solid border-gray-500 text-2xl text-center whitespace-nowrap"> {headerText} </div>
                )}
                <div className="pt-2">
                    {body}
                </div>
            </div>
        </Popup>
    );
}


