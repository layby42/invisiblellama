var lines = (function () {
		const _allLines = [
			[0,1,2,3,4,5,6,7,8],
			[9,10,11,12,13,14,15,16,17],
			[18,19,20,21,22,23,24,25,26],
			[27,28,29,30,31,32,33,34,35],
			[36,37,38,39,40,41,42,43,44],
			[45,46,47,48,49,50,51,52,53],
			[54,55,56,57,58,59,60,61,62],
			[63,64,65,66,67,68,69,70,71],
			[72,73,74,75,76,77,78,79,80],
			[0,9,18,27,36,45,54,63,72],
			[1,10,19,28,37,46,55,64,73],
			[2,11,20,29,38,47,56,65,74],
			[3,12,21,30,39,48,57,66,75],
			[4,13,22,31,40,49,58,67,76],
			[5,14,23,32,41,50,59,68,77],
			[6,15,24,33,42,51,60,69,78],
			[7,16,25,34,43,52,61,70,79],
			[8,17,26,35,44,53,62,71,80],
			[0,10,20,30,40,50,60,70,80],
			[1,11,21,31,41,51,61,71],
			[2,12,22,32,42,52,62],
			[3,13,23,33,43,53],
			[4,14,24,34,44],
			[4,12,20,28,36],
			[5,13,21,29,37,45],
			[6,14,22,30,38,46,54],
			[7,15,23,31,39,47,55,63],
			[8,16,24,32,40,48,56,64,72],
			[17,25,33,41,49,57,65,73],
			[26,34,42,50,58,66,74],
			[35,43,51,59,67,75],
			[44,52,60,68,76],
			[9,19,29,39,49,59,69,79],
			[18,28,38,48,58,68,78],
			[27,37,47,57,67,77],
			[36,46,56,66,76],
			];

	var _score = 0;

	function allTokens() {
		return $("div.cell-invisiblellama > img");
	}

	function emptyTokens() {
		return $("div.cell-invisiblellama > img.empty");
	}

	function cellToken(id) {
		return $("div.cell-invisiblellama > img.token#token-"+id);
	}

	function emptyToken(item) {
		$(item).addClass("empty").removeClass("token selected").prop("src", "../resources/images/empty.png");
	};

	function setToken(item, token) {
		$(item).addClass("token").removeClass("empty").prop("src", "../resources/images/default/"+token);
	};

	function updateGameOver() {
		if (emptyTokens().length == 0) {
			$("#over-invisiblellama").show();
		} else {
			$("#over-invisiblellama").hide();
		}
	};

	function cleanBoard() {
		$.each(allTokens(), function(index, item){emptyToken(item);});
		updateGameOver();
	};

	function placeNextThree() {
		if (!cleanFive()) {
			for (var i = 0; i < 3; i++) {
				var tokens = emptyTokens();

				// no empty left
		    if (tokens.length == 0) break;

		    setToken(tokens[Math.floor(Math.random() * tokens.length)], "token"+Math.floor(Math.random() * 7) + ".png")
			};
			cleanFive();
			// game is over
			updateGameOver();
		};
	};

	function cleanFive() {
		var completeLines = [];

		// collect completed lines
		for (var i = 0; i < _allLines.length; i++) {
			var token = "";
			var line = [];
			for (var j = 0; j < _allLines[i].length; j++) {
				var img = cellToken(_allLines[i][j]);

				if (img.length > 0) {
					var src = $(img[0]).prop("src");
					if (token == src) {
						line.push(_allLines[i][j]);
					} else {
						if (line.length >= 5) completeLines.push(line);
						token = src;
						line = [_allLines[i][j]];
					};
				} else {
					if (line.length >= 5) completeLines.push(line);
					token = "";
					line = [];
				};
			};

			if (line.length >= 5) completeLines.push(line);
		};

		// update score and remove completed
		var score = 0;
		for (var i = 0; i < completeLines.length; i++) {
			// formula: lineSizeCoefficient * (2 * _lines.size() - _lineSize)
			// lineSizeCoefficient is 2 for 4, 3 for 5 and 4 for 6
			score += 3 * (2 * completeLines[i].length - 5);
			for (var j = 0; j < completeLines[i].length; j++) {
				$.each(cellToken(completeLines[i][j]), function(index, item) {
					emptyToken(item);
				});
			};
		};

		// store state and display score
		if (score > 0) addScore(score);

		return (score > 0);
	};

	function addScore(value) {
		_score += value;
		$("#score-invisiblellama").html(_score);
	};

	function getSteps (from, to) {
		if (from == to) return [from];

		var order = [];
		if (from > to) {
			if (from%9 > to%9) {
				order = ["left", "top", "bottom", "right"];
			} else {
				order = ["top", "right", "left", "bottom"];
			}
		} else {
			if (from%9 < to%9) {
				order = ["right", "bottom", "top", "left"];
			} else {
				order = ["bottom", "left", "right", "top"];
			}
		}

		var steps = [];
		for (var i=0; i<order.length; i++){
			var id = -1;
			switch(order[i]) {
		    case "top":
		    	if (from > 8) id = from-9;
		      break;
		    case "left":
		    	if (from%9 > 0) id = from-1;
		      break;
		    case "bottom":
		    	if (from < 72) id = from+9;
		      break;
		    case "right":
		    	if (from%9 < 8) id = from+1;
		      break;
			}

			if ((id >= 0) && (cellToken(id).length == 0)) {
				steps.push(id);
			}
		}

		return steps;
	}

	function getPath (from, to, visited) {
		// 1. if destination available right away - go there
		var steps = getSteps(from, to);
		if (steps.indexOf(to) >= 0) return [from, to];

		// 2. otherwise search path
		var path = [from];
		for (var i = 0; i < steps.length; i++){
			// 2.1 skip visited
			if (visited.indexOf(steps[i]) >= 0) continue;

			// 2.2 search subpath
			var subPath = getPath(steps[i], to, visited.concat(path));
			// console.log("in cycle " + steps[i] + ": " + subPath.toString());

			// 2.3 stop searching if found
			if (subPath.indexOf(to) >= 0) return path.concat(subPath);
		};

		return path;
	};

	var startGame = function (){
		cleanBoard();
	  placeNextThree();
		_score = 0;
	  addScore(0);
	};

	var moveToken = function (fromCell, toCell) {
		var tokenFrom = $(fromCell).children("img.token.selected");
		var tokenTo = $(toCell).children("img.empty");

		if ((tokenFrom.length == 0) || (tokenTo.length == 0)) {
			return;
		}

		var idTo = parseInt(tokenTo[0].id.replace("token-", ""));
		var idFrom = parseInt(tokenFrom[0].id.replace("token-", ""));
		var path = getPath(idFrom, idTo, []);

		if (path.length > 1) {
			var source = $(tokenFrom).prop("src").split("/");
			if (source.length > 0) {
				setToken(tokenTo, source[source.length-1]);
				emptyToken(tokenFrom);
				placeNextThree();
			}
		} else {
			$(tokenFrom).removeClass("selected");
		}
	};

	return {
		startGame : startGame,
		moveToken : moveToken
	};

}());

(function () {
	// select
  $(document).on('click', 'div.cell-invisiblellama > img.token', function(event) {
  	$("div.cell-invisiblellama > img.token").removeClass("selected");
    $(this).addClass("selected");
  });

  // move
  $(document).on('click', "div.cell-invisiblellama:has(img.empty)", function(event) {
  	lines.moveToken($("div.cell-invisiblellama:has(img.token.selected)"), $(this));
  });
})();
