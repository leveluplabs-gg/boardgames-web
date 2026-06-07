(function() {
	var storageKey = 'level-up-tabletop-game-log';
	var form = document.getElementById('game-log-form');
	var table = document.getElementById('game-log-table');
	var exportButton = document.getElementById('export-game-log');
	var clearButton = document.getElementById('clear-game-log');
	var dateField = document.getElementById('played-date');

	if (!form || !table)
		return;

	function readLog() {
		try {
			return JSON.parse(localStorage.getItem(storageKey)) || [];
		} catch (error) {
			return [];
		}
	}

	function writeLog(log) {
		localStorage.setItem(storageKey, JSON.stringify(log));
	}

	function escapeHtml(value) {
		return String(value || '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	function formatDate(value) {
		if (!value)
			return '';

		var date = new Date(value + 'T00:00:00');

		return date.toLocaleDateString('en-GB', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	function renderLog() {
		var tbody = table.querySelector('tbody');
		var log = readLog();

		if (log.length === 0) {
			tbody.innerHTML = '<tr><td colspan="7">No games logged yet.</td></tr>';
			return;
		}

		tbody.innerHTML = log.map(function(entry, index) {
			return '<tr>' +
				'<td>' + escapeHtml(formatDate(entry.date)) + '</td>' +
				'<td>' + escapeHtml(entry.game) + '</td>' +
				'<td>' + escapeHtml(entry.players) + '</td>' +
				'<td>' + escapeHtml(entry.winner) + '</td>' +
				'<td>' + escapeHtml(entry.scores) + '</td>' +
				'<td>' + escapeHtml(entry.notes) + '</td>' +
				'<td><button type="button" class="button small remove-game-log-entry" data-index="' + index + '">Remove</button></td>' +
			'</tr>';
		}).join('');
	}

	function downloadLog() {
		var log = readLog();
		var rows = [['Date', 'Game', 'Players', 'Winner', 'Scores', 'Notes']].concat(log.map(function(entry) {
			return [entry.date, entry.game, entry.players, entry.winner, entry.scores, entry.notes];
		}));
		var csv = rows.map(function(row) {
			return row.map(function(value) {
				return '"' + String(value || '').replace(/"/g, '""') + '"';
			}).join(',');
		}).join('\n');
		var link = document.createElement('a');

		link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
		link.download = 'level-up-tabletop-game-log.csv';
		link.click();
		URL.revokeObjectURL(link.href);
	}

	if (dateField && !dateField.value)
		dateField.valueAsDate = new Date();

	form.addEventListener('submit', function(event) {
		event.preventDefault();

		var log = readLog();

		log.unshift({
			date: document.getElementById('played-date').value,
			game: document.getElementById('game-name').value.trim(),
			players: document.getElementById('players').value.trim(),
			winner: document.getElementById('winner-name').value.trim(),
			scores: document.getElementById('scores').value.trim(),
			notes: document.getElementById('notes').value.trim()
		});

		writeLog(log);
		form.reset();

		if (dateField)
			dateField.valueAsDate = new Date();

		renderLog();
	});

	table.addEventListener('click', function(event) {
		if (!event.target.classList.contains('remove-game-log-entry'))
			return;

		var log = readLog();
		var index = Number(event.target.getAttribute('data-index'));

		log.splice(index, 1);
		writeLog(log);
		renderLog();
	});

	if (exportButton) {
		exportButton.addEventListener('click', function() {
			downloadLog();
		});
	}

	if (clearButton) {
		clearButton.addEventListener('click', function() {
			if (!window.confirm('Clear the full game log?'))
				return;

			writeLog([]);
			renderLog();
		});
	}

	renderLog();
})();
