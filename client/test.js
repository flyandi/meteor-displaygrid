
Grid = false;

Template.grid.rendered = function() {

	Grid = new DisplayGrid(7, 14, grid, {




	});

	Grid.load(0, 0, "/minus.png", function() {

		console.log(Grid.toSerialImage());

	});

}