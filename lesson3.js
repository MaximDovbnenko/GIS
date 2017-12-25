
var canvas_elem = document.getElementById('draw_obj');
var Canvas      = canvas_elem.getContext('2d');
var EditMode    = null;

$(document).ready(function(){
    EditMode = new Edit();
});

function MatrixGroup(){
    this.MaxRow = 25;
    this.MaxCol = 40;
    this.Matrix = [];
    this.row_length = 0;
    this.col_length = 0;
    this.empty      = 0;
    this.water      = 1;
    this.erth       = 2;
    this.building   = 3;
    this.green      = 4;
    this.cell_color = {
        0: "#616872",
        1: "#0000FF",
        2: "rgb(238, 173, 9)",
        3: "rgb(12, 47, 101)",
        4: "rgb(47, 228, 20)"
    }
    this.cell_x_size = 16;
    this.cell_y_size = 16;
}
MatrixGroup.prototype = {
    CreateMatrix: function(row, col){
        canvas_elem.height = row * 16;
        canvas_elem.width = col * 16;
        if(row > 0 && row <= this.MaxRow){
            if(col > 0 && col <=this.MaxCol){
                this.row_length = row;
                this.col_length = col;
                this.Matrix = new Array();
                for(var i = 0; i < row; i++){
                    this.Matrix[i] = new  Array();
                    for(var j = 0; j < col; j++){
                        this.Matrix[i][j] = this.empty;
                    }
                }
                return true;
            }
        }
        return false;
    },
    drawMatrix: function(){
        for(var i = 0; i < this.row_length; i++){
            for(var j = 0; j < this.col_length; j++){
                var current_group = this.Matrix[i][j];
                Canvas.fillStyle  = this.cell_color[current_group];
                Canvas.fillRect(j * this.cell_x_size, i * this.cell_y_size, this.cell_x_size, this.cell_y_size);
            }
        }
    }
};

function Edit(){
    this.StartMatrix = new MatrixGroup();
    this.EndMatrix   = new MatrixGroup();
    this.CurrentColor = -1;
    this.init();
}
Edit.prototype = {
    init: function(){
        var $this = this;
        $('#tail-water').on('click', function(){
            $this.CurrentColor = 1;
        });
        $('#tail-empty').on('click', function(){
            $this.CurrentColor = 0;
        });
        $('#tail-building').on('click', function(){
            $this.CurrentColor = 3;
        });
        $('#tail-erth').on('click', function(){
            $this.CurrentColor = 2;
        });
        $('#tail-green').on('click', function(){
            $this.CurrentColor = 4;
        });
        $('#create-btn').on('click', function(){
            $this.CreateStartMatrix();
        });
        $('#draw_obj').on('mousedown', function(e){
            var m = mouse_coords(e);
            var i = Math.floor((m.x) / 16) ;       
            var j = Math.floor((m.y) / 16) ;   
            //Canvas.fillStyle  = $this.StartMatrix.cell_color[$this.CurrentColor]; 
            $this.StartMatrix.Matrix[j][i] =  $this.CurrentColor; 
            $this.StartMatrix.drawMatrix();
        });

    },
    //Создаем стартовую матрицу...
    CreateStartMatrix: function() {
        var col = $('#col-size').val();
        var row = $('#row-size').val();
        var state = this.StartMatrix.CreateMatrix(row, col);
        if(state){
            $("#set-size").hide(1000);
            $(".map-container").show(1000);
            this.StartMatrix.drawMatrix();
        }
    }
}

function mouse_coords(e) {                  // функция возвращает экранные координаты курсора мыши
    var m = [];
    var rect = canvas_elem.getBoundingClientRect();
    m.x = e.clientX - rect.left;
    m.y = e.clientY - rect.top;
    return m;
}

