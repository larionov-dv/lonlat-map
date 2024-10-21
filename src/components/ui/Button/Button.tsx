import React, {FC} from 'react';
import cls from './Button.module.scss';

interface Props {
	onClick: () => void;
	icon?: string;
	hint?: string;
}

const Button: FC<Props> = ({onClick, icon, hint}) => {

	return (
		<div className={cls.button} onClick={() => onClick()} title={hint}>
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
				<path d={icon}/>
			</svg>
		</div>
);
};

export default Button;