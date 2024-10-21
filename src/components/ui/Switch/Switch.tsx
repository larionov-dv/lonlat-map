import React, {FC, useMemo} from 'react';
import cls from './Switch.module.scss';

interface Props {
	text: string;
	value: boolean;
	onSwitch: (newValue: boolean) => void;
	disabled?: boolean;
}

const Switch: FC<Props> = ({text, value, onSwitch, disabled}) => {

	const switchClassName = useMemo(() => {
		const classes: string[] = [cls.switch];
		if (value) {
			classes.push(cls.switch__on);
		}
		if (disabled === true) {
			classes.push(cls.switch__disabled);
		}
		return classes.join(' ');
	}, [value, disabled]);

	return (
		<div className={switchClassName}>
			<div className={cls.switch__knob} onClick={() => onSwitch(!value)}>
				<div className={cls.switch__slider}>
					<div>off</div>
					<div>on</div>
				</div>
			</div>
			<div className={cls.switch__text}>{text}</div>
		</div>
	);
};

export default Switch;