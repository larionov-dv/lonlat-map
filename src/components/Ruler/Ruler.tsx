import React, {FC} from 'react';
import cls from './Ruler.module.scss';
import {LineDef} from "../CoordinateGrid/CoordinateGrid";

export enum RulerType {
	TOP, RIGHT, BOTTOM, LEFT
}

interface Props {
	items: LineDef[];
	type: RulerType;
}

const Ruler: FC<Props> = ({items, type}) => {

	// a mapping between the ruler types and the class names
	const CLASSNAMES: string[] = [cls.ruler__top, cls.ruler__right, cls.ruler__bottom, cls.ruler__left];

	const horizontal: boolean = type === RulerType.TOP || type === RulerType.BOTTOM;

	return (
		<div className={[cls.ruler, CLASSNAMES[type]].join(' ')}>
			{items.map(item => <span key={item.pos} style={{left: horizontal ? item.pos : 10, top: horizontal ? 'auto' : item.pos}}>{item.html}</span>)}
		</div>
	);
};

export default Ruler;