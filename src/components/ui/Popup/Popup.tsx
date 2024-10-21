import React, {FC, PropsWithChildren, useMemo} from 'react';
import cls from './Popup.module.scss';

interface Props {
	visible: boolean;
	onClose: () => void;
	top: number;
}

const Popup: FC<PropsWithChildren<Props>> = ({children, visible, onClose, top}) => {

	const popupClassName = useMemo(() => {
		const classes: string[] = [cls.popup];
		if (visible) {
			classes.push(cls.popup__visible);
		}
		return classes.join(' ');
	}, [visible]);

	return (
		<div className={popupClassName} style={{top}}>
			{children}
			<div className={cls.popup__close} onClick={() => onClose()} title="Close settings"></div>
		</div>
	);
};

export default Popup;