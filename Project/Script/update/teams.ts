import { Data } from '../data/data-object.ts';
import { Codec } from '../codec/codec.ts';
import { File } from '../file/file-system-core.ts';
import { Updater } from './updater.ts';

Updater.updateTeams = function (verNum) {
	if (verNum < Updater.getVersionNumber('1.0.68')) {
		Data.teams.collisions = Codec.encodeTeamData(
			Codec.decodeTeamData(Data.teams.relations, Data.teams.list.length).fill(1)
		);
		File.planToSave(Data.manifest.project.teams);
	}
};
