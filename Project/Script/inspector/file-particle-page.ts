import { Inspector } from './inspector.ts';

{
	const FileParticle = {
		create: null
	};

	FileParticle.create = function () {
		return {
			layers: []
		};
	};

	Inspector.fileParticle = FileParticle;
}
