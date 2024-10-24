import React, {FC, useMemo} from 'react';
import cls from './Button.module.scss';

interface Props {
	onClick: (newState?: boolean) => void;
	icon?: string;
	hint?: string;
	keepState?: boolean;	// keep pressed state when clicked
	pressed?: boolean;		// whether the button is pressed or not; ignored if keepState is false or undefined
}

const Button: FC<Props> = ({onClick, icon, hint, keepState, pressed}) => {

	const buttonClassName = useMemo(() => {
		const classes: string[] = [cls.button];
		if (keepState && pressed) {
			classes.push(cls.button__pressed);
		}
		return classes.join(' ');
	}, [keepState, pressed]);

	const buttonClick = () => {
		if (keepState) {
			onClick(!pressed);
		} else {
			onClick();
		}
	};

	return (
		<div className={buttonClassName} onClick={buttonClick} title={hint}>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<path d={icon}/>
			</svg>
		</div>
	);
};

export default Button;