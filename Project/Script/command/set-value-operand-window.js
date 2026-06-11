'use strict'

// ******************************** 设置数值 - 操作数窗口 ********************************

const NumberOperand = {
	// properties
	target: null,
	// methods
	initialize: null,
	parseMathMethod: null,
	parseStringMethod: null,
	parseObjectProperty: null,
	parseElementProperty: null,
	parseOther: null,
	parseOperand: null,
	parse: null,
	open: null,
	save: null,
	// events
	confirm: null
}

// 初始化
NumberOperand.initialize = function () {
	// 创建头部操作选项
	$('#setNumber-operation').loadItems([
		{ name: 'Set', value: 'set' },
		{ name: 'Add', value: 'add' },
		{ name: 'Sub', value: 'sub' },
		{ name: 'Mul', value: 'mul' },
		{ name: 'Div', value: 'div' },
		{ name: 'Mod', value: 'mod' }
	])

	// 创建操作选项
	$('#setNumber-operand-operation').loadItems([
		{ name: 'Add', value: 'add' },
		{ name: 'Sub', value: 'sub' },
		{ name: 'Mul', value: 'mul' },
		{ name: 'Div', value: 'div' },
		{ name: 'Mod', value: 'mod' },
		{ name: '(Add)', value: 'add()' },
		{ name: '(Sub)', value: 'sub()' },
		{ name: '(Mul)', value: 'mul()' },
		{ name: '(Div)', value: 'div()' },
		{ name: '(Mod)', value: 'mod()' }
	])

	// 创建类型选项
	$('#setNumber-operand-type').loadItems([
		{ name: 'Constant', value: 'constant' },
		{ name: 'Variable', value: 'variable' },
		{ name: 'Math', value: 'math' },
		{ name: 'String', value: 'string' },
		{ name: 'Object', value: 'object' },
		{ name: 'Element', value: 'element' },
		{ name: 'List', value: 'list' },
		{ name: 'Parameter', value: 'parameter' },
		{ name: 'Script', value: 'script' },
		{ name: 'Other', value: 'other' }
	])

	// 设置类型关联元素
	$('#setNumber-operand-type')
		.enableHiddenMode()
		.relate([
			{
				case: 'constant',
				targets: [$('#setNumber-operand-constant-value')]
			},
			{
				case: 'variable',
				targets: [$('#setNumber-operand-common-variable')]
			},
			{ case: 'math', targets: [$('#setNumber-operand-math-method')] },
			{
				case: 'string',
				targets: [
					$('#setNumber-operand-string-method'),
					$('#setNumber-operand-common-variable')
				]
			},
			{
				case: 'object',
				targets: [$('#setNumber-operand-object-property')]
			},
			{
				case: 'element',
				targets: [
					$('#setNumber-operand-element-property'),
					$('#setNumber-operand-element-element')
				]
			},
			{
				case: 'list',
				targets: [
					$('#setNumber-operand-common-variable'),
					$('#setNumber-operand-list-index')
				]
			},
			{
				case: 'parameter',
				targets: [$('#setNumber-operand-parameter-key')]
			},
			{ case: 'script', targets: [$('#setNumber-operand-script')] },
			{ case: 'other', targets: [$('#setNumber-operand-other-data')] }
		])

	// 设置类型写入事件，切换变量输入框的过滤器
	$('#setNumber-operand-type').on('write', (event) => {
		let filter = 'all'
		switch (event.value) {
			case 'variable':
			case 'math':
				filter = 'number'
				break
			case 'string':
				filter = 'string'
				break
			case 'object':
			case 'list':
				filter = 'object'
				break
		}
		$('#setNumber-operand-common-variable').filter = filter
	})

	// 创建数学方法选项
	$('#setNumber-operand-math-method').loadItems([
		{ name: 'Round', value: 'round' },
		{ name: 'Floor', value: 'floor' },
		{ name: 'Ceil', value: 'ceil' },
		{ name: 'Sqrt', value: 'sqrt' },
		{ name: 'Abs', value: 'abs' },
		{ name: 'Cos(radians)', value: 'cos' },
		{ name: 'Sin(radians)', value: 'sin' },
		{ name: 'Tan(radians)', value: 'tan' },
		{ name: 'Random[0,1)', value: 'random' },
		{ name: 'Random Int', value: 'random-int' },
		{ name: 'Distance', value: 'distance' },
		{ name: 'Horizontal Distance', value: 'distance-x' },
		{ name: 'Vertical Distance', value: 'distance-y' },
		{ name: 'Relative Angle', value: 'relative-angle' }
	])

	// 设置数学方法关联元素
	$('#setNumber-operand-math-method')
		.enableHiddenMode()
		.relate([
			{
				case: 'round',
				targets: [
					$('#setNumber-operand-common-variable'),
					$('#setNumber-operand-math-decimals')
				]
			},
			{
				case: ['floor', 'ceil', 'sqrt', 'abs', 'cos', 'sin', 'tan'],
				targets: [$('#setNumber-operand-common-variable')]
			},
			{
				case: 'random-int',
				targets: [
					$('#setNumber-operand-math-min'),
					$('#setNumber-operand-math-max')
				]
			},
			{
				case: [
					'distance',
					'distance-x',
					'distance-y',
					'relative-angle'
				],
				targets: [
					$('#setNumber-operand-math-startPosition'),
					$('#setNumber-operand-math-endPosition')
				]
			}
		])

	// 创建字符串方法选项
	$('#setNumber-operand-string-method').loadItems([
		{ name: 'Get Length', value: 'length' },
		{ name: 'Parse Number', value: 'parse' },
		{ name: 'Get Index of Substring', value: 'search' }
	])

	// 设置字符串方法关联元素
	$('#setNumber-operand-string-method')
		.enableHiddenMode()
		.relate([
			{
				case: ['length', 'parse'],
				targets: [$('#setNumber-operand-common-variable')]
			},
			{
				case: 'search',
				targets: [
					$('#setNumber-operand-common-variable'),
					$('#setNumber-operand-string-search')
				]
			}
		])

	// 创建对象属性选项
	$('#setNumber-operand-object-property').loadItems([
		{ name: 'Actor - X', value: 'actor-x' },
		{ name: 'Actor - Y', value: 'actor-y' },
		{ name: 'Actor - UI X', value: 'actor-ui-x' },
		{ name: 'Actor - UI Y', value: 'actor-ui-y' },
		{ name: 'Actor - Screen X', value: 'actor-screen-x' },
		{ name: 'Actor - Screen Y', value: 'actor-screen-y' },
		{ name: 'Actor - Angle', value: 'actor-angle' },
		{ name: 'Actor - Direction Angle', value: 'actor-direction' },
		{ name: 'Actor - Movement Speed', value: 'actor-movement-speed' },
		{ name: 'Actor - Collision Size', value: 'actor-collision-size' },
		{ name: 'Actor - Collision Weight', value: 'actor-collision-weight' },
		{ name: 'Actor - Scaling Factor', value: 'actor-scaling-factor' },
		{
			name: 'Actor - Item Quantity',
			value: 'actor-inventory-item-quantity'
		},
		{
			name: 'Actor - Equipment Quantity',
			value: 'actor-inventory-equipment-quantity'
		},
		{ name: 'Actor - Inventory Money', value: 'actor-inventory-money' },
		{
			name: 'Actor - Inventory Used Space',
			value: 'actor-inventory-used-space'
		},
		{ name: 'Actor - Inventory Version', value: 'actor-inventory-version' },
		{ name: 'Actor - Skill Version', value: 'actor-skill-version' },
		{ name: 'Actor - State Version', value: 'actor-state-version' },
		{ name: 'Actor - Equipment Version', value: 'actor-equipment-version' },
		{ name: 'Actor - Shortcut Version', value: 'actor-shortcut-version' },
		{
			name: 'Actor - Anim Current Time',
			value: 'actor-animation-current-time'
		},
		{ name: 'Actor - Anim Duration', value: 'actor-animation-duration' },
		{ name: 'Actor - Anim Progress', value: 'actor-animation-progress' },
		{ name: 'Actor - Cooldown Time', value: 'actor-cooldown-time' },
		{ name: 'Actor - Cooldown Duration', value: 'actor-cooldown-duration' },
		{ name: 'Actor - Cooldown Progress', value: 'actor-cooldown-progress' },
		{ name: 'Skill - Cooldown Time', value: 'skill-cooldown-time' },
		{ name: 'Skill - Cooldown Duration', value: 'skill-cooldown-duration' },
		{ name: 'Skill - Cooldown Progress', value: 'skill-cooldown-progress' },
		{ name: 'State - Current Time', value: 'state-current-time' },
		{ name: 'State - Duration', value: 'state-duration' },
		{ name: 'State - Progress', value: 'state-progress' },
		{ name: 'Equipment - Order in Inventory', value: 'equipment-order' },
		{ name: 'Item - Order in Inventory', value: 'item-order' },
		{ name: 'Item - Quantity', value: 'item-quantity' },
		{ name: 'Trigger - Speed', value: 'trigger-speed' },
		{ name: 'Trigger - Angle', value: 'trigger-angle' },
		{ name: 'Tilemap - Width', value: 'tilemap-width' },
		{ name: 'Tilemap - Height', value: 'tilemap-height' },
		{ name: 'Tilemap - Tag', value: 'tilemap-tag' },
		{ name: 'List - Length', value: 'list-length' }
	])

	// 设置对象属性关联元素
	$('#setNumber-operand-object-property')
		.enableHiddenMode()
		.relate([
			{
				case: [
					'actor-x',
					'actor-y',
					'actor-ui-x',
					'actor-ui-y',
					'actor-screen-x',
					'actor-screen-y',
					'actor-angle',
					'actor-direction',
					'actor-movement-speed',
					'actor-collision-size',
					'actor-collision-weight',
					'actor-scaling-factor',
					'actor-inventory-money',
					'actor-inventory-used-space',
					'actor-inventory-version',
					'actor-skill-version',
					'actor-state-version',
					'actor-equipment-version',
					'actor-shortcut-version',
					'actor-animation-current-time',
					'actor-animation-duration',
					'actor-animation-progress'
				],
				targets: [$('#setNumber-operand-common-actor')]
			},
			{
				case: 'actor-inventory-item-quantity',
				targets: [
					$('#setNumber-operand-common-actor'),
					$('#setNumber-operand-object-itemId')
				]
			},
			{
				case: 'actor-inventory-equipment-quantity',
				targets: [
					$('#setNumber-operand-common-actor'),
					$('#setNumber-operand-object-equipmentId')
				]
			},
			{
				case: [
					'actor-cooldown-time',
					'actor-cooldown-duration',
					'actor-cooldown-progress'
				],
				targets: [
					$('#setNumber-operand-common-actor'),
					$('#setNumber-operand-cooldown-key')
				]
			},
			{
				case: [
					'skill-cooldown-time',
					'skill-cooldown-duration',
					'skill-cooldown-progress'
				],
				targets: [$('#setNumber-operand-common-skill')]
			},
			{
				case: [
					'state-current-time',
					'state-duration',
					'state-progress'
				],
				targets: [$('#setNumber-operand-common-state')]
			},
			{
				case: 'equipment-order',
				targets: [$('#setNumber-operand-common-equipment')]
			},
			{
				case: ['item-order', 'item-quantity'],
				targets: [$('#setNumber-operand-common-item')]
			},
			{
				case: ['trigger-speed', 'trigger-angle'],
				targets: [$('#setNumber-operand-common-trigger')]
			},
			{
				case: ['tilemap-width', 'tilemap-height'],
				targets: [$('#setNumber-operand-common-tilemap')]
			},
			{
				case: 'tilemap-tag',
				targets: [
					$('#setNumber-operand-common-tilemap'),
					$('#setNumber-operand-tilemapPosition')
				]
			},
			{
				case: 'list-length',
				targets: [$('#setNumber-operand-common-variable')]
			}
		])

	// 创建元素属性选项
	$('#setNumber-operand-element-property').loadItems([
		{ name: 'Element - X', value: 'element-x' },
		{ name: 'Element - Y', value: 'element-y' },
		{ name: 'Element - Width', value: 'element-width' },
		{ name: 'Element - Height', value: 'element-height' },
		{
			name: 'Element - Number of Children',
			value: 'element-children-count'
		},
		{
			name: 'Element - Index of the Selected Button',
			value: 'element-index-of-selected-button'
		},
		{ name: 'Transform - Anchor X', value: 'transform-anchorX' },
		{ name: 'Transform - Anchor Y', value: 'transform-anchorY' },
		{ name: 'Transform - X', value: 'transform-x' },
		{ name: 'Transform - Y', value: 'transform-y' },
		{ name: 'Transform - Width', value: 'transform-width' },
		{ name: 'Transform - Height', value: 'transform-height' },
		{ name: 'Transform - X2', value: 'transform-x2' },
		{ name: 'Transform - Y2', value: 'transform-y2' },
		{ name: 'Transform - Width2', value: 'transform-width2' },
		{ name: 'Transform - Height2', value: 'transform-height2' },
		{ name: 'Transform - Rotation', value: 'transform-rotation' },
		{ name: 'Transform - Scale X', value: 'transform-scaleX' },
		{ name: 'Transform - Scale Y', value: 'transform-scaleY' },
		{ name: 'Transform - Skew X', value: 'transform-skewX' },
		{ name: 'Transform - Skew Y', value: 'transform-skewY' },
		{ name: 'Transform - Opacity', value: 'transform-opacity' },
		{
			name: 'Window - Visible Grid Columns',
			value: 'window-visibleGridColumns'
		},
		{ name: 'Window - Visible Grid Rows', value: 'window-visibleGridRows' },
		{ name: 'Text - Text Width', value: 'text-textWidth' },
		{ name: 'Text - Text Height', value: 'text-textHeight' },
		{ name: 'Text Box - Number', value: 'textBox-number' },
		{ name: 'Dialog Box - Print End X', value: 'dialogBox-printEndX' },
		{ name: 'Dialog Box - Print End Y', value: 'dialogBox-printEndY' }
	])

	// 创建其他数据选项
	$('#setNumber-operand-other-data').loadItems([
		{ name: 'Event Trigger Mouse Button', value: 'trigger-button' },
		{ name: 'Event Trigger Wheel Delta Y', value: 'trigger-wheel-y' },
		{
			name: 'Event Trigger Gamepad Button',
			value: 'trigger-gamepad-button'
		},
		{ name: 'Gamepad Left Stick Angle', value: 'gamepad-left-stick-angle' },
		{
			name: 'Gamepad Right Stick Angle',
			value: 'gamepad-right-stick-angle'
		},
		{ name: 'Mouse Screen X', value: 'mouse-screen-x' },
		{ name: 'Mouse Screen Y', value: 'mouse-screen-y' },
		{ name: 'Mouse UI X', value: 'mouse-ui-x' },
		{ name: 'Mouse UI Y', value: 'mouse-ui-y' },
		{ name: 'Mouse Scene X', value: 'mouse-scene-x' },
		{ name: 'Mouse Scene Y', value: 'mouse-scene-y' },
		{ name: 'Touch Screen X', value: 'touch-screen-x' },
		{ name: 'Touch Screen Y', value: 'touch-screen-y' },
		{ name: 'Touch UI X', value: 'touch-ui-x' },
		{ name: 'Touch UI Y', value: 'touch-ui-y' },
		{ name: 'Touch Scene X', value: 'touch-scene-x' },
		{ name: 'Touch Scene Y', value: 'touch-scene-y' },
		{ name: 'Virtual Axis X', value: 'virtual-axis-x' },
		{ name: 'Virtual Axis Y', value: 'virtual-axis-y' },
		{ name: 'Virtual Axis Angle', value: 'virtual-axis-angle' },
		{ name: 'Start Position X', value: 'start-position-x' },
		{ name: 'Start Position Y', value: 'start-position-y' },
		{ name: 'Camera X', value: 'camera-x' },
		{ name: 'Camera Y', value: 'camera-y' },
		{ name: 'Camera Zoom', value: 'camera-zoom' },
		{ name: 'Raw Camera Zoom', value: 'raw-camera-zoom' },
		{ name: 'Screen Width', value: 'screen-width' },
		{ name: 'Screen Height', value: 'screen-height' },
		{ name: 'Scene Width', value: 'scene-width' },
		{ name: 'Scene Height', value: 'scene-height' },
		{ name: 'Scene Scale', value: 'scene-scale' },
		{ name: 'UI Scale', value: 'ui-scale' },
		{ name: 'Play Time', value: 'play-time' },
		{ name: 'Elapsed Time', value: 'elapsed-time' },
		{ name: 'Delta Time', value: 'delta-time' },
		{ name: 'Raw Delta Time', value: 'raw-delta-time' },
		{ name: 'Get Timestamp', value: 'timestamp' },
		{ name: 'Party Version', value: 'party-version' },
		{ name: 'Number of Party Members', value: 'party-member-count' },
		{ name: 'Number of Actors in the Scene', value: 'actor-count' },
		{ name: 'Latest Item Increment', value: 'latest-item-increment' },
		{ name: 'Latest Money Increment', value: 'latest-money-increment' },
		{ name: 'Loader - Loaded Bytes', value: 'loader-loaded-bytes' },
		{ name: 'Loader - Total Bytes', value: 'loader-total-bytes' },
		{
			name: 'Loader - Completion Progress',
			value: 'loader-completion-progress'
		}
	])

	// 设置其他数据关联元素
	$('#setNumber-operand-other-data')
		.enableHiddenMode()
		.relate([
			{
				case: [
					'touch-screen-x',
					'touch-screen-y',
					'touch-ui-x',
					'touch-ui-y',
					'touch-scene-x',
					'touch-scene-y'
				],
				targets: [$('#setNumber-operand-other-touchId')]
			},
			{
				case: 'actor-count',
				targets: [$('#setNumber-operand-other-teamId')]
			}
		])

	// 创建队伍选项 - 窗口打开事件
	$('#setNumber-operand').on('open', (event) => {
		$('#setNumber-operand-other-teamId').loadItems(Data.createTeamItems())
	})

	// 清理内存 - 窗口已关闭事件
	$('#setNumber-operand').on('closed', (event) => {
		$('#setNumber-operand-other-teamId').clear()
		$('#setNumber-operation').restore()
	})

	// 侦听事件
	$('#setNumber-operand-confirm').on('click', this.confirm)
}

// 解析数学方法
NumberOperand.parseMathMethod = function (operand) {
	const method = operand.method
	const label = Local.get('command.setNumber.math.' + method)
	switch (method) {
		case 'round': {
			const varName = Command.parseVariable(operand.variable, 'number')
			const decimals = operand.decimals
			return `${label}${Token('(')}${varName}${
				decimals
					? `${Token(', ')}${Command.setNumberColor(decimals)}`
					: ''
			}${Token(')')}`
		}
		case 'floor':
		case 'ceil':
		case 'sqrt':
		case 'abs':
		case 'cos':
		case 'sin':
		case 'tan': {
			const varName = Command.parseVariable(operand.variable, 'number')
			return `${label}${Token('(')}${varName}${Token(')')}`
		}
		case 'random': {
			const min = Command.setNumberColor(0)
			const max = Command.setNumberColor(1)
			return `${label}${Token('[')}${min}${Token(', ')}${max}${Token(')')}`
		}
		case 'random-int': {
			const min = Command.parseVariableNumber(operand.min)
			const max = Command.parseVariableNumber(operand.max)
			return `${label}${Token('[')}${min}${Token(', ')}${max}${Token(']')}`
		}
		case 'distance':
		case 'distance-x':
		case 'distance-y':
		case 'relative-angle': {
			const start = Command.parsePosition(operand.start)
			const end = Command.parsePosition(operand.end)
			return `${label}${Token('(')}${start}${Token(', ')}${end}${Token(')')}`
		}
	}
}

// 解析字符串方法
NumberOperand.parseStringMethod = function (operand) {
	const method = operand.method
	const methodName = Local.get('command.setNumber.string.' + method)
	switch (method) {
		case 'length':
		case 'parse': {
			const variable = operand.variable
			const varName = Command.parseVariable(variable, 'string')
			return methodName + Token('(') + varName + Token(')')
		}
		case 'search': {
			const { variable, search } = operand
			const varName = Command.parseVariable(variable, 'string')
			const searchName = Command.parseVariableString(search)
			return (
				methodName +
				Token('(') +
				varName +
				Token(', ') +
				searchName +
				Token(')')
			)
		}
	}
}

// 解析对象属性
NumberOperand.parseObjectProperty = function (operand) {
	const property = Local.get('command.setNumber.object.' + operand.property)
	switch (operand.property) {
		case 'actor-x':
		case 'actor-y':
		case 'actor-ui-x':
		case 'actor-ui-y':
		case 'actor-screen-x':
		case 'actor-screen-y':
		case 'actor-angle':
		case 'actor-direction':
		case 'actor-movement-speed':
		case 'actor-collision-size':
		case 'actor-collision-weight':
		case 'actor-scaling-factor':
		case 'actor-inventory-money':
		case 'actor-inventory-used-space':
		case 'actor-inventory-version':
		case 'actor-skill-version':
		case 'actor-state-version':
		case 'actor-equipment-version':
		case 'actor-shortcut-version':
		case 'actor-animation-current-time':
		case 'actor-animation-duration':
		case 'actor-animation-progress':
			return (
				Command.parseActor(operand.actor) +
				Token(' -> ') +
				property.replace('.', Token('.'))
			)
		case 'actor-inventory-item-quantity':
			return (
				Command.parseActor(operand.actor) +
				Token(' -> ') +
				Command.parseVariableFile(operand.itemId) +
				Token('.') +
				property
			)
		case 'actor-inventory-equipment-quantity':
			return (
				Command.parseActor(operand.actor) +
				Token(' -> ') +
				Command.parseVariableFile(operand.equipmentId) +
				Token('.') +
				property
			)
		case 'actor-cooldown-time':
		case 'actor-cooldown-duration':
		case 'actor-cooldown-progress': {
			const key = Command.parseVariableEnum('cooldown-key', operand.key)
			return (
				Command.parseActor(operand.actor) +
				Token(' -> ') +
				property +
				Token('(') +
				key +
				Token(')')
			)
		}
		case 'skill-cooldown-time':
		case 'skill-cooldown-duration':
		case 'skill-cooldown-progress':
			return Command.parseSkill(operand.skill) + Token(' -> ') + property
		case 'state-current-time':
		case 'state-duration':
		case 'state-progress':
			return Command.parseState(operand.state) + Token(' -> ') + property
		case 'equipment-order':
			return (
				Command.parseEquipment(operand.equipment) +
				Token(' -> ') +
				property
			)
		case 'item-order':
		case 'item-quantity':
			return Command.parseItem(operand.item) + Token(' -> ') + property
		case 'trigger-speed':
		case 'trigger-angle':
			return (
				Command.parseTrigger(operand.trigger) + Token(' -> ') + property
			)
		case 'tilemap-width':
		case 'tilemap-height':
			return (
				Command.parseTilemap(operand.tilemap) + Token(' -> ') + property
			)
		case 'tilemap-tag': {
			return (
				Command.parseTilemap(operand.tilemap) +
				Token(' -> ') +
				property +
				Token('(') +
				Command.parsePosition(operand.tilemapPosition) +
				Token(')')
			)
		}
		case 'list-length':
			return (
				Command.parseVariable(operand.variable, 'object') +
				Token(' -> ') +
				property
			)
	}
}

// 解析元素属性
NumberOperand.parseElementProperty = function (operand) {
	const element = Command.parseElement(operand.element)
	const property = Local.get('command.setNumber.element.' + operand.property)
	return element + Token(' -> ') + property.replace('.', Token('.'))
}

// 解析其他数据
NumberOperand.parseOther = function (operand) {
	const label = Local.get('command.setNumber.other.' + operand.data)
	switch (operand.data) {
		case 'touch-screen-x':
		case 'touch-screen-y':
		case 'touch-ui-x':
		case 'touch-ui-y':
		case 'touch-scene-x':
		case 'touch-scene-y': {
			const index = label.indexOf('.')
			const head = index !== -1 ? label.slice(0, index) : label
			const end = index !== -1 ? label.slice(index + 1) : ''
			return (
				head +
				Token('[') +
				Command.parseVariableNumber(operand.touchId) +
				Token(']') +
				Token('.') +
				end
			)
		}
		case 'actor-count':
			return (
				label +
				Token('(') +
				Command.parseTeam(operand.teamId) +
				Token(')')
			)
		default:
			return label.replace('.', Token('.'))
	}
}

// 解析操作数
NumberOperand.parseOperand = function (operand) {
	switch (operand.type) {
		case 'constant':
			return Command.setNumberColor(operand.value.toString())
		case 'variable':
			return Command.parseVariable(operand.variable, 'number')
		case 'math':
			return this.parseMathMethod(operand)
		case 'string':
			return this.parseStringMethod(operand)
		case 'object':
			return this.parseObjectProperty(operand)
		case 'element':
			return this.parseElementProperty(operand)
		case 'list':
			return Command.parseListItem(operand.variable, operand.index)
		case 'parameter':
			return Command.parseParameter(operand.key)
		case 'script':
			return Command.setScriptColor(operand.script)
		case 'other':
			return this.parseOther(operand)
	}
}

// 解析项目
NumberOperand.parse = function (operand, data, index) {
	let operation
	let operator
	if (index === 0) {
		operation = $('#setNumber-operation').read()
		switch (operation) {
			case 'set':
				operator = '= '
				break
			case 'add':
				operator = '+= '
				break
			case 'sub':
				operator = '-= '
				break
			case 'mul':
				operator = '*= '
				break
			case 'div':
				operator = '/= '
				break
			case 'mod':
				operator = '%= '
				break
		}
	} else {
		operation = operand.operation
		switch (operation.replace('()', '')) {
			case 'add':
				operator = '+ '
				break
			case 'sub':
				operator = '- '
				break
			case 'mul':
				operator = '* '
				break
			case 'div':
				operator = '/ '
				break
			case 'mod':
				operator = '% '
				break
		}
	}
	let operandName = Command.removeTextTags(this.parseOperand(operand))
	const currentPriority = operation.includes('()')
	const nextPriority = data[index + 1]?.operation.includes('()')
	if (!currentPriority && nextPriority) {
		operandName = '(' + operandName
	}
	if (currentPriority && !nextPriority) {
		operandName = operandName + ')'
	}
	return operator + operandName
}

// 打开数据
NumberOperand.open = function (
	operand = {
		operation: 'add',
		type: 'constant',
		value: 0
	}
) {
	Window.open('setNumber-operand')

	// 切换操作选择框
	if (this.target.start === 0) {
		$('#setNumber-operation').save()
		$('#setNumber-operation').show()
		$('#setNumber-operation').getFocus()
		$('#setNumber-operand-operation').hide()
	} else {
		$('#setNumber-operation').hide()
		$('#setNumber-operand-operation').show()
		$('#setNumber-operand-operation').getFocus()
	}

	// 加载冷却键选项
	$('#setNumber-operand-cooldown-key').loadItems(
		Enum.getStringItems('cooldown-key')
	)

	// 写入数据
	const write = getElementWriter('setNumber-operand')
	let constantValue = 0
	let mathMethod = 'round'
	let mathDecimals = 0
	let mathMin = 0
	let mathMax = 1
	let mathStartPosition = { type: 'actor', actor: { type: 'trigger' } }
	let mathEndPosition = { type: 'actor', actor: { type: 'trigger' } }
	let stringMethod = 'length'
	let stringSearch = ''
	let commonVariable = { type: 'local', key: '' }
	let objectProperty = 'actor-x'
	let objectItemId = ''
	let objectEquipmentId = ''
	let elementProperty = 'element-x'
	let elementElement = { type: 'trigger' }
	let commonActor = { type: 'trigger' }
	let commonSkill = { type: 'trigger' }
	let commonState = { type: 'trigger' }
	let commonEquipment = { type: 'trigger' }
	let commonItem = { type: 'trigger' }
	let commonTrigger = { type: 'trigger' }
	let commonTilemap = { type: 'trigger' }
	let tilemapPosition = { type: 'absolute', x: 0, y: 0 }
	let cooldownKey = Enum.getDefStringId('cooldown-key')
	let listIndex = 0
	let parameterKey = ''
	let script = ''
	let otherData = 'trigger-button'
	let otherTouchId = 0
	let otherTeamId = Data.teams.list[0].id
	switch (operand.type) {
		case 'constant':
			constantValue = operand.value
			break
		case 'variable':
			commonVariable = operand.variable
			break
		case 'math':
			mathMethod = operand.method
			commonVariable = operand.variable ?? commonVariable
			mathDecimals = operand.decimals ?? mathDecimals
			mathMin = operand.min ?? mathMin
			mathMax = operand.max ?? mathMax
			mathStartPosition = operand.start ?? mathStartPosition
			mathEndPosition = operand.end ?? mathEndPosition
			break
		case 'string':
			stringMethod = operand.method
			commonVariable = operand.variable
			stringSearch = operand.search ?? stringSearch
			break
		case 'object':
			objectProperty = operand.property
			objectItemId = operand.itemId ?? objectItemId
			objectEquipmentId = operand.equipmentId ?? objectEquipmentId
			commonActor = operand.actor ?? commonActor
			commonSkill = operand.skill ?? commonSkill
			commonState = operand.state ?? commonState
			commonEquipment = operand.equipment ?? commonEquipment
			commonItem = operand.item ?? commonItem
			commonTrigger = operand.trigger ?? commonTrigger
			commonTilemap = operand.tilemap ?? commonTilemap
			tilemapPosition = operand.tilemapPosition ?? tilemapPosition
			cooldownKey = operand.key ?? cooldownKey
			commonVariable = operand.variable ?? commonVariable
			break
		case 'element':
			elementProperty = operand.property
			elementElement = operand.element
			break
		case 'list':
			commonVariable = operand.variable
			listIndex = operand.index
			break
		case 'parameter':
			parameterKey = operand.key
			break
		case 'script':
			script = operand.script
			break
		case 'other':
			otherData = operand.data
			otherTouchId = operand.touchId ?? otherTouchId
			otherTeamId = operand.teamId ?? otherTeamId
			break
	}
	write('operation', operand.operation)
	write('type', operand.type)
	write('constant-value', constantValue)
	write('math-method', mathMethod)
	write('string-method', stringMethod)
	write('object-property', objectProperty)
	write('object-itemId', objectItemId)
	write('object-equipmentId', objectEquipmentId)
	write('element-property', elementProperty)
	write('element-element', elementElement)
	write('common-variable', commonVariable)
	write('common-actor', commonActor)
	write('common-skill', commonSkill)
	write('common-state', commonState)
	write('common-equipment', commonEquipment)
	write('common-item', commonItem)
	write('common-trigger', commonTrigger)
	write('common-tilemap', commonTilemap)
	write('tilemapPosition', tilemapPosition)
	write('string-search', stringSearch)
	write('math-decimals', mathDecimals)
	write('math-min', mathMin)
	write('math-max', mathMax)
	write('math-startPosition', mathStartPosition)
	write('math-endPosition', mathEndPosition)
	write('cooldown-key', cooldownKey)
	write('list-index', listIndex)
	write('parameter-key', parameterKey)
	write('script', script)
	write('other-data', otherData)
	write('other-touchId', otherTouchId)
	write('other-teamId', otherTeamId)
}

// 保存数据
NumberOperand.save = function () {
	const read = getElementReader('setNumber-operand')
	const operation = read('operation')
	const type = read('type')
	let operand
	switch (type) {
		case 'constant': {
			const value = read('constant-value')
			operand = { operation, type, value }
			break
		}
		case 'variable': {
			const variable = read('common-variable')
			if (VariableGetter.isNone(variable)) {
				return $('#setNumber-operand-common-variable').getFocus()
			}
			operand = { operation, type, variable }
			break
		}
		case 'math': {
			const method = read('math-method')
			switch (method) {
				case 'round': {
					const variable = read('common-variable')
					if (VariableGetter.isNone(variable)) {
						return $(
							'#setNumber-operand-common-variable'
						).getFocus()
					}
					const decimals = read('math-decimals')
					operand = { operation, type, method, variable, decimals }
					break
				}
				case 'floor':
				case 'ceil':
				case 'sqrt':
				case 'abs':
				case 'cos':
				case 'sin':
				case 'tan': {
					const variable = read('common-variable')
					if (VariableGetter.isNone(variable)) {
						return $(
							'#setNumber-operand-common-variable'
						).getFocus()
					}
					operand = { operation, type, method, variable }
					break
				}
				case 'random':
					operand = { operation, type, method }
					break
				case 'random-int': {
					const min = read('math-min')
					const max = read('math-max')
					operand = { operation, type, method, min, max }
					break
				}
				case 'distance':
				case 'distance-x':
				case 'distance-y':
				case 'relative-angle': {
					const start = read('math-startPosition')
					const end = read('math-endPosition')
					operand = { operation, type, method, start, end }
					break
				}
			}
			break
		}
		case 'string': {
			const method = read('string-method')
			const variable = read('common-variable')
			if (VariableGetter.isNone(variable)) {
				return $('#setNumber-operand-common-variable').getFocus()
			}
			switch (method) {
				case 'length':
				case 'parse':
					operand = { operation, type, method, variable }
					break
				case 'search': {
					const search = read('string-search')
					if (search === '') {
						return $('#setNumber-operand-string-search').getFocus()
					}
					operand = { operation, type, method, variable, search }
					break
				}
			}
			break
		}
		case 'object': {
			const property = read('object-property')
			switch (property) {
				case 'actor-x':
				case 'actor-y':
				case 'actor-ui-x':
				case 'actor-ui-y':
				case 'actor-screen-x':
				case 'actor-screen-y':
				case 'actor-angle':
				case 'actor-direction':
				case 'actor-movement-speed':
				case 'actor-collision-size':
				case 'actor-collision-weight':
				case 'actor-scaling-factor':
				case 'actor-inventory-money':
				case 'actor-inventory-used-space':
				case 'actor-inventory-version':
				case 'actor-skill-version':
				case 'actor-state-version':
				case 'actor-equipment-version':
				case 'actor-shortcut-version':
				case 'actor-animation-current-time':
				case 'actor-animation-duration':
				case 'actor-animation-progress': {
					const actor = read('common-actor')
					operand = { operation, type, property, actor }
					break
				}
				case 'actor-inventory-item-quantity': {
					const actor = read('common-actor')
					const itemId = read('object-itemId')
					if (itemId === '') {
						return $('#setNumber-operand-object-itemId').getFocus()
					}
					operand = { operation, type, property, actor, itemId }
					break
				}
				case 'actor-inventory-equipment-quantity': {
					const actor = read('common-actor')
					const equipmentId = read('object-equipmentId')
					if (equipmentId === '') {
						return $(
							'#setNumber-operand-object-equipmentId'
						).getFocus()
					}
					operand = { operation, type, property, actor, equipmentId }
					break
				}
				case 'actor-cooldown-time':
				case 'actor-cooldown-duration':
				case 'actor-cooldown-progress': {
					const actor = read('common-actor')
					const key = read('cooldown-key')
					if (key === '') {
						return $('#setNumber-operand-cooldown-key').getFocus()
					}
					operand = { operation, type, property, actor, key }
					break
				}
				case 'skill-cooldown-time':
				case 'skill-cooldown-duration':
				case 'skill-cooldown-progress': {
					const skill = read('common-skill')
					operand = { operation, type, property, skill }
					break
				}
				case 'state-current-time':
				case 'state-duration':
				case 'state-progress': {
					const state = read('common-state')
					operand = { operation, type, property, state }
					break
				}
				case 'equipment-order': {
					const equipment = read('common-equipment')
					operand = { operation, type, property, equipment }
					break
				}
				case 'item-order':
				case 'item-quantity': {
					const item = read('common-item')
					operand = { operation, type, property, item }
					break
				}
				case 'trigger-speed':
				case 'trigger-angle': {
					const trigger = read('common-trigger')
					operand = { operation, type, property, trigger }
					break
				}
				case 'tilemap-width':
				case 'tilemap-height': {
					const tilemap = read('common-tilemap')
					operand = { operation, type, property, tilemap }
					break
				}
				case 'tilemap-tag': {
					const tilemap = read('common-tilemap')
					const tilemapPosition = read('tilemapPosition')
					operand = {
						operation,
						type,
						property,
						tilemap,
						tilemapPosition
					}
					break
				}
				case 'list-length': {
					const variable = read('common-variable')
					if (VariableGetter.isNone(variable)) {
						return $(
							'#setNumber-operand-common-variable'
						).getFocus()
					}
					operand = { operation, type, property, variable }
					break
				}
			}
			break
		}
		case 'element': {
			const property = read('element-property')
			const element = read('element-element')
			operand = { operation, type, property, element }
			break
		}
		case 'list': {
			const variable = read('common-variable')
			const index = read('list-index')
			if (VariableGetter.isNone(variable)) {
				return $('#setNumber-operand-common-variable').getFocus()
			}
			operand = { operation, type, variable, index }
			break
		}
		case 'parameter': {
			const key = read('parameter-key')
			if (key === '') {
				return $('#setNumber-operand-parameter-key').getFocus()
			}
			operand = { operation, type, key }
			break
		}
		case 'script': {
			const script = read('script').trim()
			if (script === '') {
				return $('#setNumber-operand-script').getFocus()
			}
			operand = { operation, type, script }
			break
		}
		case 'other': {
			const data = read('other-data')
			switch (data) {
				case 'touch-screen-x':
				case 'touch-screen-y':
				case 'touch-ui-x':
				case 'touch-ui-y':
				case 'touch-scene-x':
				case 'touch-scene-y': {
					const touchId = read('other-touchId')
					operand = { operation, type, data, touchId }
					break
				}
				case 'actor-count': {
					const teamId = read('other-teamId')
					operand = { operation, type, data, teamId }
					break
				}
				default:
					operand = { operation, type, data }
					break
			}
			break
		}
	}
	$('#setNumber-operation').save()
	Window.close('setNumber-operand')
	return operand
}

// 确定按钮 - 鼠标点击事件
NumberOperand.confirm = function (event) {
	return NumberOperand.target.save()
}
