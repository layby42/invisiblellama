(function () {

	$.allCells = function(){
		return $("td.cell-invisiblellama");
	}

	$.emptyCells = function(){
		return $.allCells().has("div.empty");
	}

	$.tokenCells = function(){
		return $.allCells().has("img.token");
	}

	$.cellWithId = function(id){
		return $("td#cell-"+id);
	}

	$.cellToken = function(id){
		return $("td#cell-"+id + " > img.token");
	}

	$.emptyToken = function(){
		return "<div class='empty'></div>";
	}

	$.cleanBoard = function() {
		$("#over-invisiblellama").hide();
		$.each($.allCells(), function(index, item){item.innerHTML = $.emptyToken();});
	}

	$.initGame = function() {
		var gameLoaded = false;
		$.cleanBoard();

    if (typeof(Storage) !== "undefined") {
    	if (localStorage.state != undefined) {
    		// game state
    		$.each(localStorage.state.split(","), function(index, token){
    			if (/token[0-6].png/.test(token)) {
    				document.getElementById("cell-"+index).innerHTML = "<img class='token' src='../resources/images/default/" + token + "'/>";
    			}
    		})

    		// game over and game loaded
				if ($.emptyCells().length == 0) $("#over-invisiblellama").show();
				gameLoaded = ($.tokenCells().length > 0);

				// scores
  			if (localStorage.score !== undefined) {
    			document.getElementById("score-invisiblellama").innerHTML = localStorage.score;
  			}
    	}
    };

    if (!gameLoaded) $.startGame();
	};

	$.storeState = function(score){
		// if localStorage available
		if (typeof(Storage) !== "undefined") {
			// score
			if (localStorage.score !== undefined) score += parseInt(localStorage.score);
			localStorage.score = score;

			// state
			var state = [];
			for (var i=0; i<81;i++){
				var token = null;
				var img = $.cellToken(i);
				if (img.length > 0) {
					source = $(img[0]).prop("src").split("/");
					token=source[source.length-1]
				}
				state.push(token);
			}
    	localStorage.state = state.toString();
		};

		// display score
		document.getElementById("score-invisiblellama").innerHTML = score;
	}

	$.startGame = function() {
		$.cleanBoard();
		if (typeof(Storage) !== "undefined") {localStorage.score = 0};
		document.getElementById("score-invisiblellama").innerHTML = 0;
    $.placeNextThree();
	};

	$.placeNextThree = function() {
		var gameOver = false;

		$.cleanFive();
		for (var i = 0; i < 3; i++) {
			var cells = [];

			$.each($.emptyCells(), function(index, item){cells.push(item);});

			// no cells left
	    if (cells.length == 0) break;

	    var tokenHtml = "<img class='token' src='../resources/images/default/token" + Math.floor(Math.random() * 7) + ".png'/>";
	    cells[Math.floor(Math.random() * cells.length)].innerHTML = tokenHtml;
		};
		$.cleanFive();

		// game is over
		if ($.emptyCells().length == 0) $("#over-invisiblellama").show();
	};

	$.cleanFive = function() {
		const lines = [
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

		// collect completed lines
		var completeLine = [];
		for (var i = 0; i < lines.length; i++) {
			var token = "";
			var line = [];
			for (var j = 0; j < lines[i].length; j++) {
				var img = $.cellToken(lines[i][j]);
				if (img.length > 0) {
					var src = $(img[0]).prop("src");
					if (token == src) {
						line.push(lines[i][j]);
					} else {
						if (line.length >= 5) completeLine.push(line);
						token = src;
						line = [lines[i][j]];
					};
				} else {
					if (line.length >= 5) completeLine.push(line);
					token = "";
					line = [];
				};
			};

			if (line.length >= 5) completeLine.push(line);
		};

		// update score and remove completed
		var score = 0;
		for (var i = 0; i < completeLine.length; i++) {
			// formula: lineSizeCoefficient * (2 * _lines.size() - _lineSize)
			// lineSizeCoefficient is 2 for 4, 3 for 5 and 4 for 6
			score += 3 * (2 * completeLine[i].length - 5);
			for (var j = 0; j < completeLine[i].length; j++) {
				$.each($.cellWithId(completeLine[i][j]).has("img.token"), function( index, item ) {
					item.innerHTML = $.emptyToken();
				});
			};
		};

		// store state and display score
		$.storeState(score);
	};

	$.getSteps = function (from, to) {
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

			if ((id >= 0) && ($.cellWithId(id).has("img.token").length == 0)) {
				steps.push(id);
			}
		}

		return steps;
	}

	$.getPath = function(from, to, visited) {
		// 1. if destination available right away - go there
		var steps = $.getSteps(from, to);
		if (steps.indexOf(to) >= 0) return [from, to];

		// 2. otherwise search path
		var path = [from];
		for (var i = 0; i < steps.length; i++){
			// 2.1 skip visited
			if (visited.indexOf(steps[i]) >= 0) continue;

			// 2.2 search subpath
			var subPath = $.getPath(steps[i], to, visited.concat(path));
			// console.log("in cycle " + steps[i] + ": " + subPath.toString());

			// 2.3 stop searching if found
			if (subPath.indexOf(to) >= 0) return path.concat(subPath);
		};

		return path;
	};

	// select
  $(document).on('click', 'td.cell-invisiblellama > img.token', function(event) {
  	$("td.cell-invisiblellama > img.token").removeClass("selected");
    $(this).addClass("selected");
  });

  // move
  $(document).on('click', 'td.cell-invisiblellama > div.empty', function(event) {
  	var cellTo = $(this).parent("td.cell-invisiblellama");
  	var cellFrom = $.tokenCells().has("img.token.selected");

  	if (cellFrom.length > 0) {
  		var cellToId = parseInt(cellTo[0].id.replace("cell-", ""));
  		var cellFromId = parseInt(cellFrom[0].id.replace("cell-", ""));

  		// check if the move can be done and calculate path
  		var path = $.getPath(cellFromId, cellToId, []);
  		// console.log(path);

  		// there is start and end
  		if (path.length > 1) {
		  	var img = $("td.cell-invisiblellama > img.token.selected").detach();
	  		var empty = $(this).detach();
	  		cellFrom.append(empty);
				cellTo.append(img);
				img.removeClass("selected");

	    	$.placeNextThree();
  		} else {
  			$("td.cell-invisiblellama > img.token.selected").removeClass("selected");
  		}
  	};
  });
})();
