// ******************************** main/apk.ts 配置契约 ********************************

/**
 * APK 打包配置契约。
 *
 * 替代 main/apk.js:16-41 的 defaultConfig 无类型字面量，
 * 收敛为精确接口。字段清单经 grep `config.\w+` 全量访问实证（17 字段）。
 */
export interface ApkConfig {
	/** �原始 APK �路径 */
	apkPath: string;
	/** 反编译输出目录 */
	outputDir: string;
	/** 新 APK 输出路径 */
	newApkPath: string;
	/** apktool.jar 路径 */
	apktoolPath: string;
	/** 新包名 */
	packageName: string;
	/** 新应用名称 */
	appName: string;
	/** 新图标路径 */
	iconPath: string;
	/** 版本名称 */
	versionName: string;
	/** 版本号（整数） */
	versionCode: number;
	/** 是否签名 */
	isSign: boolean;
	/** JKS 密钥库路径 */
	jksPath: string;
	/** 密钥库密码 */
	keyStorePassword: string;
	/** 密钥别名 */
	keyAlias: string;
	/** 密钥密码 */
	keyPassword: string;
	/** apksigner 路径 */
	apksignerPath: string;
	/** 签名后 APK 路径 */
	signedApkPath: string;
	/** zipalign 路径 */
	zipalignPath: string;
	/** 项目路径 */
	projectPath: string;
}

/**
 * apkProcessor.main(options) 形参契约。
 *
 * 替代 main/apk.js:104 的 `options = {}` 无类型形参，
 * 收敛为精确接口。
 */
export interface ApkOptions {
	/** 用户传入配置（合并 defaultConfig） */
	config?: Partial<ApkConfig>;
	/** 进度回调（消息，百分比 0-100） */
	onProgress?: (message: string, progress: number) => void;
	/** 外部中止信号 */
	signal?: AbortSignal;
}

/** apkProcessor.main 返回值契约（false = 失败/拒绝，true = 成功） */
export type ApkResult = boolean;
