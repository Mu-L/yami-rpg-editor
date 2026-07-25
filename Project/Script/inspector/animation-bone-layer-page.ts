import { Inspector } from './inspector.ts';

{
	const AnimJointLayer = {
		create: null
	};

	AnimJointLayer.create = function () {
		return {
			class: 'joint',
			name: 'Joint',
			expanded: true,
			hidden: false,
			locked: false,
			frames: [Inspector.animJointFrame.create()],
			children: []
		};
	};

	Inspector.animJointLayer = AnimJointLayer;
}
