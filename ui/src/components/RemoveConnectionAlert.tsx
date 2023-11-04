import { Alert } from "@blueprintjs/core";

type RemoveConnectionAlertProps = {
    isOpen: boolean,
    onConfirm: () => void,
    onCancel: () => void,
};

export const RemoveConnectionAlert = ({ isOpen, onConfirm, onCancel }: RemoveConnectionAlertProps) => {
    return (
        <Alert 
            confirmButtonText='Remove'
            cancelButtonText='Cancel'
            icon='trash'
            intent='danger'
            isOpen={isOpen}
            onConfirm={onConfirm} 
            onCancel={onCancel}
        >
            <p>
                Are you sure you want to remove this connection?
            </p>
        </Alert>
    )
}