'use strict'

Command.cases.comment = {
	initialize: function () {
		$('#comment-confirm').on('click', this.save)
	},
	parse: function ({ comment }) {
		const contents = []
		const lines = comment.split('\n')
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
	load: function ({ comment = '' }) {
		$('#comment-comment').write(comment)
		$('#comment-comment').getFocus('end')
	},
	save: function () {
		const comment = $('#comment-comment').read()
		if (comment === '') {
			return $('#comment-comment').getFocus()
		}
		Command.save({ comment })
	}
}
