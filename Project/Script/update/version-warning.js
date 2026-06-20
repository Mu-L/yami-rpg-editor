'use strict'

// 获取TS版本更新警告
Updater.getTSVersionWarning = function () {
	if ('zh-CN|zh-TW'.includes(Local.language)) {
		return {
			message: `当前项目版本: 1.0.121\n将升级到版本: ${Updater.latestProjectVersion}\n本次为破坏性更新，替换项目中的JS为TS脚本，一部分变量命名发生了变化。\n这可能导致用户导入的插件和指令脚本失效报错。\n建议在更新前手动备份项目文件夹，点击更新后也会在项目的父级目录下生成备份。\n如果你有旧项目需要升级，请按照Steam更新公告中的步骤来修复因更新造成的错误。\n如果想继续用上一个版本，打开Steam->库->应用->属性->测试版，选择JS版本分支。\n对于造成的不便十分抱歉，今后TS版本将是长期稳定版本，不再大幅修改。`,
			confirm: '立即更新',
			cancel: '不想升级'
		}
	} else {
		return {
			message: `Current project version: 1.0.121\nUpgrading to version: ${Updater.latestProjectVersion}\nThis is a breaking update, replacing JS scripts in the project with TS scripts, causing some variable names to change.\nThis may result in imported plugins and command scripts failing or reporting errors.\nIt is recommended to manually back up the project folder before updating. A backup will also be created in the parent directory of the project after clicking update.\nIf you have an old project that needs upgrading, please follow the steps in the Steam update announcement to fix errors caused by the update.\nIf you wish to continue using the previous version, go to Steam -> Library -> Application -> Properties -> Betas and select the JS version branch.\nWe sincerely apologize for the inconvenience. The TS version will be the long-term stable version, with no major modifications.`,
			confirm: 'Update Now',
			cancel: 'Cancel'
		}
	}
}
