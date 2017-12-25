
var canvas_elem = document.getElementById('draw_obj');
var Canvas      = canvas_elem.getContext('2d');
var EditMode    = null;
var DefaultStart = [
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4],
    [2,2,2,2,2,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4],
    [2,2,2,2,4,1,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4],
    [0,0,0,4,1,1,1,4,2,2,2,2,2,2,0,0,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4],
    [0,0,4,1,1,1,1,4,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4],
    [0,0,0,4,1,1,4,2,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4],
    [2,2,2,2,4,4,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4,4,4],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4,4,4],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,4],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,4,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
    [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
];
$(document).ready(function(){
    EditMode = new Edit();
});

function MatrixGroup(){
    this.MaxRow = 25;
    this.MaxCol = 40;
    this.Matrix = [];
    this.row_length = 17;
    this.col_length = 36;
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
    this.cell_x_size = 32;
    this.cell_y_size = 32;
    
}
MatrixGroup.prototype = {
    CreateMatrix: function(row, col){
        canvas_elem.height = row * 32;
        canvas_elem.width = col * 32;
        if(row > 0 && row <= this.MaxRow){
            if(col > 0 && col <=this.MaxCol){
                this.row_length = row;
                this.col_length = col;
                this.Matrix = new Array();
                for(var i = 0; i < row; i++){
                    this.Matrix[i] = new  Array();
                    for(var j = 0; j < col; j++){
                        this.Matrix[i][j] = 0;
                    }
                }
                for(var i = 0; i < this.row_length; i++){
                    for(var j = 0; j < this.col_length; j++){
                        this.get_next(i,j);
                    }
                }
                for(var i = 0; i < this.row_length; i++){
                    for(var j = 0; j < this.col_length; j++){
                        var c = this.Matrix[i][j] + Math.floor(Math.random() * (350 - 100 + 1)) + 100;
                        ;
                        if(c < 0){
                            this.Matrix[i][j] = this.water;
                            continue;
                        }else if( c> 0 && c < 100){
                            this.Matrix[i][j] = this.erth;
                            continue;
                        }else{
                            this.Matrix[i][j] = this.green;
                            continue;
                        }
                    }
                }
                return true;
            }
        }
        return false;
    },
    get_next: function(px,py){
        var Rad = 1;
        var height = 0.001;
        for(var i = 0; i < this.row_length; i++){
            for(var j = 0; j < this.col_length; j++){
                var d = Rad * Rad -((px-i)*(px-i)+(py-j)*(py-j)); 
                var val = d*height;
                this.Matrix[i][j]+=d*height;
            }
        }
    },
    loadDefault: function(matrix){
        canvas_elem.height = this.row_length * 32;
        canvas_elem.width  = this.col_length * 32;
        
        this.Matrix = matrix;
    },
    drawMatrix: function(){
        for(var i = 0; i < this.row_length; i++){
            for(var j = 0; j < this.col_length; j++){
                var current_group = this.Matrix[i][j];
                Canvas.fillStyle  = this.cell_color[current_group];
                Canvas.fillRect(j * this.cell_x_size, i * this.cell_y_size, this.cell_x_size, this.cell_y_size);
            }
        }
    },

    //Расчет колличевства групп на карте(аозможно тут же буду считать и другоие праметры)
    calculateGroup: function(){
        var group = [0, 1, 2, 3, 4];
        var mask  = this.create_empty_mask();
        for(var g = 0; g < group.length; g++){
            var current_group = group[g];
            for(var i = 1; i < this.row_length - 1; i++){
                for(var j = 1; j < this.col_length - 1; j++){
                    
                }
            }
        }
    },
    
    create_empty_mask: function(){
        var mask  = new  Array();
        for(var i = 0; i < this.row_length; i++){
            mask [i] = new  Array();
            for(var j = 0; j < this.col_length; j++){
                mask [i][j] = this.empty;
            }
        }
        return mask;
    }
};

function Edit(){
    this.StartMatrix = new MatrixGroup();
    this.EndMatrix   = new MatrixGroup();
    this.CurrentColor = -1;
    this.CurrentCreate = 'start';
    this.is_need_load_default = false;
    this.init();
}
Edit.prototype = {
    init: function(){
        var $this = this;
        $('#tail-water').on('click', function(){ $this.CurrentColor = 1;});
        $('#tail-empty').on('click', function(){ $this.CurrentColor = 0;});
        $('#tail-building').on('click', function(){$this.CurrentColor = 3;});
        $('#tail-erth').on('click', function(){$this.CurrentColor = 2;});
        $('#tail-green').on('click', function(){$this.CurrentColor = 4;});
        $('#create-btn').on('click', function(){
            if(this.CurrentCreate = 'start'){
                if(!$this.is_need_load_default)
                $this.CreateStartMatrix();
            else
                $this.CreateDefaultStart();
            }else{

            }
        
        });
        $('#draw_obj').on('mousedown', function(e){
            var m = mouse_coords(e);
            var i = Math.floor((m.x) / 32) ;       
            var j = Math.floor((m.y) / 32) ;   
            //Canvas.fillStyle  = $this.StartMatrix.cell_color[$this.CurrentColor]; 
            $this.StartMatrix.Matrix[j][i] =  $this.CurrentColor; 
            $this.StartMatrix.drawMatrix();
        });
        $('#check-default').on('change', function(){
            $this.is_need_load_default = $(this).is(':checked')
            if($this.is_need_load_default){
                $('#col-size').attr('disabled', 'true');
                $('#row-size').attr('disabled', 'true');
            }else{
                $('#col-size').removeAttr('disabled');
                $('#row-size').removeAttr('disabled');
            }
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
    },
    CreateDefaultStart: function() {
        this.StartMatrix.loadDefault(DefaultStart);
        $("#set-size").hide(1000);
        $(".map-container").show(1000);
        this.StartMatrix.drawMatrix();
    }
}

function mouse_coords(e) {                  // функция возвращает экранные координаты курсора мыши
    var m = [];
    var rect = canvas_elem.getBoundingClientRect();
    m.x = e.clientX - rect.left;
    m.y = e.clientY - rect.top;
    return m;
}

