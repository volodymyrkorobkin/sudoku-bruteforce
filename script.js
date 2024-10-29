class SudokuSolver{
    constructor(){
        this.initVariables();
        this.renderGrid();

        this.stopSignal = false;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    initVariables(){
        this.grid = [];

        for (let i = 0; i < 9; i++) {
            this.grid[i] = [];
            for (let j = 0; j < 9; j++) {
                this.grid[i][j] = 0;
            }
        }
    }

    renderGrid(){
        document.getElementById("root").innerHTML = "";

        const grid = document.createElement("div");
        grid.classList.add("grid");

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const square = document.createElement("div");
                square.classList.add("square");

                for (let y = 0; y < 3; y++) {
                    for (let x = 0; x < 3; x++) {
                        const cellWrapper = document.createElement("div");
                        cellWrapper.classList.add("cell-wrapper");
                        const cell = document.createElement("input");

                        if (this.grid[(j * 3) + x][(i * 3) + y] === 0) {
                            cell.setAttribute("user-input", "false");
                            cell.value = "";
                        } else {
                            cell.setAttribute("user-input", "true");
                            cell.value = this.grid[(j * 3) + x][(i * 3) + y];
                        }
                        cell.classList.add("cell");
                        cell.setAttribute("type", "text");
                        cell.setAttribute("maxlength", "1");
                        cell.setAttribute("size", "1");
                        cell.setAttribute("data-x", (j * 3) + x);
                        cell.setAttribute("data-y", (i * 3) + y);
                        cell.addEventListener("input", (e) => {
                            const x = e.target.getAttribute("data-x");
                            const y = e.target.getAttribute("data-y");
                            let value = e.target.value;

                            if (e.target.value === "") {
                                e.target.setAttribute("user-input", "false");
                                value = 0;
                            } else {
                                e.target.setAttribute("user-input", "true");
                                value = parseInt(e.target.value);
                            }
                            

                            this.grid[x][y] = value;
                        });
                        cell.addEventListener("click", (e) => {
                            e.target.select();
                        });
                        cell.addEventListener("focus", (e) => {
                            e.target.select();
                        });

                        cellWrapper.appendChild(cell);
                        square.appendChild(cellWrapper);
                    }
                }

                grid.appendChild(square);
            }
        }

        const root = document.getElementById("root");
        root.appendChild(grid);

        // Solve Button
        const solveButton = document.createElement("button");
        solveButton.innerText = "Solve";
        solveButton.classList.add("solve-btn");
        solveButton.addEventListener("click", () => {
            this.stopSignal = false;
            this.solve();
        });
        root.appendChild(solveButton);

        // Stop Button
        const stopButton = document.createElement("button");
        stopButton.innerText = "Stop";
        stopButton.classList.add("stop-btn");
        stopButton.addEventListener("click", () => {
            this.stopSignal = true;
        });
        root.appendChild(stopButton);


        // Check Validity Button
        const checkValidityBtn = document.createElement("button");
        checkValidityBtn.innerText = "Check Validity";
        checkValidityBtn.classList.add("check-validity-btn");
        checkValidityBtn.addEventListener("click", () => {
            if(this.isValid()){
                alert("Valid");
            }else{
                alert("Invalid");
            }
        });
        root.appendChild(checkValidityBtn);

        //Save Button
        const saveButton = document.createElement("button");
        saveButton.innerText = "Save";
        saveButton.classList.add("save-btn");
        saveButton.addEventListener("click", () => {
            localStorage.setItem("sudoku", JSON.stringify(this.grid));
        });
        root.appendChild(saveButton);

        //Load Button
        const loadButton = document.createElement("button");
        loadButton.innerText = "Load";
        loadButton.classList.add("load-btn");
        loadButton.addEventListener("click", () => {
            const data = JSON.parse(localStorage.getItem("sudoku"));
            if(data){
                this.grid = data;
                this.renderGrid();
            }
        });
        root.appendChild(loadButton);

        // Reset Button
        const resetButton = document.createElement("button");
        resetButton.innerText = "Reset";
        resetButton.classList.add("reset-btn");
        resetButton.addEventListener("click", () => {
            this.initVariables();
            this.renderGrid();
        });
        root.appendChild(resetButton); 
    }

    async setCellValue(x, y, value){
        if (this.grid[x][y] === 0) {
            await this.sleep(10);
        }

        this.grid[x][y] = value;
        if (value === 0) {
            value = "";
        }
        const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
        cell.value = value;

        
    }



    isValidSet(set){
        const seen = new Set();
        for (let i = 0; i < set.length; i++) {
            if (set[i] === 0) {
                continue;
            }
            if (seen.has(set[i])) {
                return false;
            }
            seen.add(set[i]);
        }
        return true;
    }


    isValid(){
        // Check rows
        for (let x = 0; x < 9; x++) {
            const row = this.grid[x];
            if (!this.isValidSet(row)) {
                return false;
            }
        }

        // Check columns
        for (let y = 0; y < 9; y++) {
            const column = [];
            for (let x = 0; x < 9; x++) {
                column.push(this.grid[x][y]);
            }
            if (!this.isValidSet(column)) {
                return false;
            }
        }

        // Check squares
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const square = [];
                for (let x = 0; x < 3; x++) {
                    for (let y = 0; y < 3; y++) {
                        square.push(this.grid[(i * 3) + x][(j * 3) + y]);
                    }
                }
                if (!this.isValidSet(square)) {
                    return false;
                }
            }
        }

        return true;
    }



    //Solution code

    async solve(){
        let x = 0, y = 0;

        let goindBack = false;

        while(true){
            if (this.stopSignal) {
                break;
            }

            if(x === 9){
                y++;
                x = 0;
            }
            if(y === 9){
                break;
            }

            // Check if the current cell value is valid
            if (x < 0) {
                if (y === 0) {
                    console.log("Sudoku is not solvable");
                    alert("Sudoku is not solvable");
                    break;
                } else {
                    y--;
                    x = 8;
                }
            }

            const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);

            if(cell.getAttribute("user-input") === "true"){
                if (goindBack) {
                    x--;
                } else {
                    x++;
                }
                continue;
            } else {
                goindBack = false;
            }

            // Fill the cell with the next value
            let failed = false;
            if (this.grid[x][y] === 0) {
                await this.setCellValue(x, y, 1);
            } else {
                if (this.grid[x][y] < 9) {
                    await this.setCellValue(x, y, this.grid[x][y] + 1);
                } else {
                    failed = true;
                }
            }

            // Check if the current cell value is valid
            if(failed){
                await this.setCellValue(x, y, 0);
                x--;
                goindBack = true;
                continue;
            }

            // Check if the current cell value is valid
            if (x < 0) {
                if (y === 0) {
                    console.log("Sudoku is not solvable");
                    alert("Sudoku is not solvable");
                    break;
                } else {
                    y--;
                    x = 8;
                }
            }

            if (this.isValid()) {
                x++;
            } else {
                continue;
            }
        }

        console.log("Solved");

    }


}


document.addEventListener("DOMContentLoaded", () =>{
    const sudoku = new SudokuSolver();

    console.log("Sudoku Solver Loaded");

    document.addEventListener("keydown", (e) => {
        if(e.key === "Enter"){
            for (let i = 0; i < 9; i++) {
                console.log(sudoku.grid[i]);
            }
        }
    });

});