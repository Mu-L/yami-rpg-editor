'use strict'

Command.cases.comment = new CommandSchema({
	name: 'comment',
	fields: [{ key: 'comment', domId: 'comment', default: '', required: true }],
	customParse({ comment }) {
		const lines = comment.split('\n')
		const contents = []
		for (const line of lines) {
			if (contents.length === 0) {
				contents.push({ color: 'comment' }, { text: line })
			} else {
				contents.push({ break: true }, { text: line })
			}
		}
		if (lines.length > 1) {
			contents.unshift({ fold: true })
		}
		return contents
	},
	onLoad() {
		$('#comment-comment').getFocus('end')
	}
})
