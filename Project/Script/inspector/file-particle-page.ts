import { Inspector } from './inspector.ts';

// ******************************** 文件 - 粒子页面 ********************************

{
	const FileParticle = {
		// methods
		create: null
	};

	// 创建粒子
	FileParticle.create = function () {
		return {
			layers: []
		};
	};

	Inspector.fileParticle = FileParticle;
}
