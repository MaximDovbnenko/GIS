
var canvas_elem = document.getElementById('draw_obj');
var Canvas      = canvas_elem.getContext('2d');
var EditMode    = null;
var GameObj     = null;

var DefaultStart = [
    [2,2,2,1,1],
    [2,1,1,1,1],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [2,1,1,1,1],
];

$(document).ready(function(){
    EditMode = new Edit();
});

function Point2D(){
    this.x = 0;
    this.y = 0;
}
Point2D.prototype = {
    create: function(_x, _y){
        this.x = _x; this.y = _y;
    }
};
function MatrixGroup(){
    this.MaxRow = 25;
    this.MaxCol = 25;
    this.Matrix = [];
    this.row_length = 5;
    this.col_length = 5;

    this.empty      = 0;
    this.water      = 1;
    this.erth       = 2;
    this.building   = 3;
    this.green      = 4;

    this.name = {
        0: "Пусто",
        1: "Вода",
        2: "Земля",
        3: "Застройка",
        4: "Лес"
    }
    this.cell_color = {
        0: "#616872",
        1: "#0000FF",
        2: "rgb(238, 173, 9)",
        3: "rgb(12, 47, 101)",
        4: "rgb(47, 228, 20)"
    }
    this.cell_x_size = 24;
    this.cell_y_size = 24;
    
}
MatrixGroup.prototype = {
    CreateMatrix: function(row, col){
        //И так...
        canvas_elem.height = row * this.cell_x_size;
        canvas_elem.width  = col * this.cell_y_size;
        if(row > 0 && row <= this.MaxRow){
            if(col > 0 && col <=this.MaxCol){
                this.row_length = row;
                this.col_length = col;
                this.Matrix = new Array();
                for(var i = 0; i < row; i++){
                    this.Matrix[i] = new  Array();
                    for(var j = 0; j < col; j++){
                        this.Matrix[i][j] = this._get_random(1, 4);
                    }
                }
                for(var i = 0; i < 5; i++)
                    this.genirate_step();
                return true;
            }
        }
        return false;
    },
    
    genirate_step: function(){
        for(var i = 1; i < this.row_length - 1; i++){
            for(var j = 1; j < this.col_length - 1; j++){
                var current_type = this.Matrix[i][j];
                for(var dir_i = -1; dir_i <= 1; dir_i++){
                    for(var dir_j = -1; dir_j <= 1; dir_j++){
                        if(dir_i != 0 && dir_j != 0){
                            var state = this.Matrix[i + dir_i][j + dir_j];
                            if(current_type == this.water && state != this.water){
                                var rnd = this._get_random(0, 100);
                                this.Matrix[i + dir_i][j + dir_j] = rnd > 20? this.erth : this.water;
                                continue;
                            }
                            if(current_type == this.erth && state != this.erth){
                                var rnd = this._get_random(0, 100);
                                this.Matrix[i + dir_i][j + dir_j] = rnd > 50? this.green : this.water;
                                continue;
                            }
                            if(current_type == this.building && state != this.building){
                                var rnd = this._get_random(0, 100);
                                this.Matrix[i + dir_i][j + dir_j] = rnd > 50 ? this.building: this.erth;
                                continue;
                            }
                        }   
                    }
                }
            }
        }
    },
    loadDefault: function(matrix){
        canvas_elem.height = this.row_length * 24;
        canvas_elem.width  = this.col_length * 24;
        this.Matrix = matrix;
    },
    drawMatrix: function(offset, context){
        for(var i = 0; i < this.row_length; i++){
            for(var j = 0; j < this.col_length; j++){
                var current_group = this.Matrix[i][j];
                context.fillStyle  = this.cell_color[current_group];
                context.fillRect(offset + (j * this.cell_x_size), i * this.cell_y_size, this.cell_x_size, this.cell_y_size);
            }
        }
    },
    customDraw: function(){
        // ctx.fillText("Fill text", 20, 50);
        for(var i = 0; i < this.row_length; i++){
            for(var j = 0; j < this.col_length; j++){
                var current_group = this.Matrix[i][j];
                Canvas.fillStyle  = this.cell_color[current_group];
                Canvas.clearRect(j * this.cell_x_size, i * this.cell_y_size, this.cell_x_size, this.cell_y_size);
                Canvas.strokeRect(j * this.cell_x_size, i * this.cell_y_size, this.cell_x_size, this.cell_y_size);
                Canvas.fillText(current_group, (j * this.cell_x_size) + 12, (i * this.cell_y_size) + 12);
            }
        }
    },
    _get_random: function(min, max){
        return Math.round(Math.random() * (max - min) + min);
    },
    //Расчет колличевства групп на карте
    calculateGroup: function(){
        var GroupResult = [];
        var Mask = this.create_empty_mask();
        for(var group = 0; group <= 4; group++){
            for(var i = 0; i < this.row_length; i++){
                for(var j = 0; j < this.col_length; j++){
                    var stack = [];
                    var point = new Point2D();
                    var current_group = {
                        id:    0,
                        count: 0
                    };
                    point.x = i;
                    point.y = j;
                    stack.push(point);
                    while(stack.length != 0){
                        var current_point = stack.pop();
                        if(group != this.Matrix[i][j]){
                            continue;
                        }else{
                            if(Mask[current_point.x][current_point.y] == 1) { continue; }
                            Mask[current_point.x][current_point.y] = 1;
                            current_group.id = group;
                            current_group.count++;
                            for(var dx = -1; dx <= 1; dx++){
                                for(var dy = -1; dy <= 1; dy++){
                                    var cx = current_point.x + dx;
                                    var cy = current_point.y + dy;
                                    if(cx < 0 || cx >= this.row_length){ continue; }
                                    if(cy < 0 || cy >= this.col_length){ continue; }
                                    if(Mask[cx][cy] == 1){ continue; }
                                    if(this.Matrix[cx][cy] == group){
                                        var pt = new Point2D();
                                        pt.x = cx;
                                        pt.y = cy;
                                        stack.push(pt);
                                    }
                                
                                }
                            }
                        }
                    }   
                    if(current_group.count != 0){
                        GroupResult.push(current_group);
                    }
                }
            }
        }
        return GroupResult;
    }, 
    create_empty_mask: function(){
        var mask  = new  Array();
        for(var i = 0; i < this.row_length; i++){
            mask [i] = new  Array();
            for(var j = 0; j < this.col_length; j++){
                mask[i][j] = this.empty;
            }
        }
        return mask;
    }
};

function Edit(){
    this.StartMatrix = new MatrixGroup();
    this.EndMatrix   = new MatrixGroup();
    this.PriceMatrix = new MatrixGroup();
    this.CurrentColor = -1;
    this.CurrentCreate = 'start';
    this.is_need_load_default = false;
    this.Ii = 0;
    this.Ij = 0;
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
        $('#next-btn').on('click', function(){ $this.CreateEndMatrix();});
        $('#create-btn').on('click', function(){ $this.CreateStartMatrix();});
        $('#price-geo-btn').on('click', function(){$this.CreatePriceMatrix();});
        $('#start-game-btn').on('click', function(){ 
            $(".map").hide(1000);   
            $('#title-step').hide();
            $("#game").show(1000);   
            GameObj = new Game(); 
            GameObj.init($this.StartMatrix, $this.EndMatrix, $this.PriceMatrix);
        });
        $('#draw_obj').on('mousedown', function(e){
            var m = mouse_coords(e,canvas_elem);
            var i = Math.floor((m.x) / 24) ;       
            var j = Math.floor((m.y) / 24) ;   
            if($this.CurrentCreate == 'start'){
                $this.StartMatrix.Matrix[j][i] =  $this.CurrentColor; 
                $this.StartMatrix.drawMatrix(0, Canvas);
                $this.ubdate_table($this.StartMatrix);
            }else if($this.CurrentCreate == 'end'){
                $this.EndMatrix.Matrix[j][i] =  $this.CurrentColor; 
                $this.EndMatrix.drawMatrix(0, Canvas);
                $this.ubdate_table($this.EndMatrix);
            } else{
                $this.PriceMatrix.Matrix[j][i]++;
                $this.PriceMatrix.customDraw();
            }        
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
        $('#title-step').text('Создайте начальную карту');
        var col = $('#col-size').val();
        var row = $('#row-size').val();
        var state = this.StartMatrix.CreateMatrix(row, col);
        if(state){
            var start_group = this.StartMatrix.calculateGroup();
            $("#set-size").hide(1000);
            $(".map").show(1000);
            this.StartMatrix.drawMatrix(0, Canvas);
            this.ubdate_table(this.StartMatrix);
        }
    },
    CreateEndMatrix: function(){
        $('#title-step').text('Создайте целевую карту');
        $('#next-btn').hide();
        $('#price-geo-btn').show();
        this.CurrentCreate = 'end';
        var col = this.StartMatrix.col_length;
        var row = this.StartMatrix.row_length;
        var state = this.EndMatrix.CreateMatrix(row, col);
        if(state){
            var start_group = this.EndMatrix.calculateGroup();
            this.EndMatrix.drawMatrix(0, Canvas);
            this.ubdate_table(this.EndMatrix);
        }
    },
    CreatePriceMatrix: function(){
        $('#title-step').text('Карта ценности территорий');
        $('#price-geo-btn').hide();
        $('#start-game-btn').show();
        var $this = this;
        $('#nput-price').show();
        $('#nput-price').on('click', function(){
            $this._set_price_value($this);
        });
        this.CurrentCreate = 'price';
        $('.map-container').hide();
        $('#count-group-tb').empty();
        var col = this.EndMatrix.col_length;
        var row = this.EndMatrix.row_length;
        var state = this.PriceMatrix.CreateMatrix(row, col);
        this.PriceMatrix.Matrix = this.EndMatrix.Matrix;
        if(state){
            this.PriceMatrix.customDraw();
        }
    },
    _set_price_value: function(obj){
        obj.PriceMatrix.Matrix[obj.Ii][obj.Ij] = $('#nput-price').val();
    },
    CreateDefaultStart: function() {
        this.StartMatrix.loadDefault(DefaultStart);
        $("#set-size").hide(1000);
        $(".map-container").show(1000);
        this.StartMatrix.drawMatrix(0, Canvas);
        this.ubdate_table(this.StartMatrix);
    },
    ubdate_table: function(current_matrix){
        var t_body       = $('<tbody></tbody>');
        $('#count-group-tb').empty();
        var group_result = current_matrix.calculateGroup();
        var CounterGroup = [];
        for(var i = 0; i <= 4; i++){
            var tmp_group = {};
            tmp_group.id = i;
            tmp_group.count = 0;
            tmp_group.S = 0;
            for(var j = 0; j < group_result.length; j++){
                if(group_result[j].id == tmp_group.id){
                    tmp_group.count++;
                    tmp_group.S += group_result[j].count;
                }
            }
            CounterGroup.push(tmp_group);
        } 
        for(var i = 0; i < CounterGroup.length; i++){
            var $tr = $('<tr>');
            $tr.append('<td>'+ current_matrix.name[CounterGroup[i].id] + '</td>');
            $tr.append('<td>'+ CounterGroup[i].count + ' pci </td>');
            $tr.append('<td>'+ CounterGroup[i].S + ' sq </td>');
            $tr.appendTo(t_body);
        }
        t_body.appendTo($('#count-group-tb'));
    }
}


function Game(){
    this.CurrentMatrix = new MatrixGroup();
    this.EndMatrix     = new MatrixGroup();
    this.Price         = new MatrixGroup();
    this.canvas_elem_local  = document.getElementById('game-canvas');
    this.context            = this.canvas_elem_local.getContext('2d');
    this.Group              = {
        0: {
            id:     0,
            color:  '#616872',
            price:  $('input[name="empty-price"]').val(),
            delete: $('input[name="empty-create"]').val(),
            create: $('input[name="empty-delete"]').val()
        },
        1: {
            id:     1,
            color:  '#0000FF',
            price:  $('input[name="water-price"]').val(),
            delete: $('input[name="water-create"]').val(),
            create: $('input[name="water-delete"]').val()
        },
        2: {
            id:     2,
            color:  'rgb(238, 173, 9)',
            price:  $('input[name="erth-price"]').val(),
            delete: $('input[name="erth-create"]').val(),
            create: $('input[name="erth-delete"]').val()
        },
        3: {
            id:     3,
            color:  'rgb(12, 47, 101)',
            price:  $('input[name="building-price"]').val(),
            delete: $('input[name="building-create"]').val(),
            create: $('input[name="building-delete"]').val()
        },
        4: {
            id:     4,
            color:  'rgb(47, 228, 20)',
            price:  $('input[name="green-price"]').val(),
            delete: $('input[name="green-create"]').val(),
            create: $('input[name="green-delete"]').val()
        }
    };
    this.TmpMatrix = {
        0: { tmp_matrix: this.CurrentMatrix },
        1: { tmp_matrix: this.CurrentMatrix },
        2: { tmp_matrix: this.CurrentMatrix },
    }
    this.game_current_block = $('#current-elem');
    this.ITR_STEP  = 0;
    this.STEP      = 0;
    this.current_i = 0;
    this.current_j = 0;
    this.LocalCounter = 100;
}
Game.prototype = {
    //Рисуем оба игровых поля
    init: function(start_matrix, end_matrix, price){
        var $this = this;
        this.CurrentMatrix  = start_matrix;
        this.EndMatrix      = end_matrix;
        this.Price = price;
        this.TmpMatrix = {
            0: { tmp_matrix: this.CurrentMatrix },
            1: { tmp_matrix: this.CurrentMatrix },
            2: { tmp_matrix: this.CurrentMatrix },
        }
        $('#game-canvas').attr('height', ((this.CurrentMatrix.row_length * 24)));
        $('#game-canvas').attr('width',  ((this.CurrentMatrix.row_length * 24) * 2) + 50);
        $('#game-canvas').on('mousedown', function(e){
            $this.update_state(e);
        });
        $('#append-to-tmp').on('click', function(){
            $this._append_to_tmp();
        });
        this.update();
    },
    _append_to_tmp: function(){
        var $this = this;
        var integrate = this.calculate(this.TmpMatrix[this.ITR_STEP].tmp_matrix);
        var row = $('<tr key='+ this.ITR_STEP  +'><th>Решение-'+ (this.ITR_STEP + 1) +'</th><td>'+ integrate +'</td><tr>').on('click', function(){

        });
        row.appendTo($('tbody', $('#tmp-table')));
        this.ITR_STEP++;
        this.TmpMatrix[$this.ITR_STEP].tmp_matrix = this.CurrentMatrix; 
        this.update();
    },
    _append_current_block: function(id){
        var current_group = this.Group[id];
        return $('<div>').css('background-color', current_group.color).addClass('empty_color');
    },
    _append_view: function(id){
        $('#game-status').empty();
        this.game_current_block.empty();
        this._append_current_block(id).appendTo(this.game_current_block);
        var $this = this;
        var delete_btn = $('<button  type="button" class="btn btn-primary">Удалить</button>').on('click', function(){
            $this.TmpMatrix[$this.ITR_STEP].tmp_matrix.Matrix[$this.current_j][$this.current_i] = 0;
            $this.LocalCounter -= $this.Group[id].delete;
            $('#game-status').empty();
            $this.game_current_block.empty();
            $this.update();
        });
        delete_btn.appendTo(this.game_current_block);
        for(var key in $this.Group){
            var div = $('<div>').css('margin-left', '20px');
            if($this.Group[key].id == id || $this.Group[key].id == 0) { continue; }
            var edt_btn = $('<button key="'+key+'" type="button" class="btn btn-primary">Вставить</button>').on('click', function(){
                var i = $(this).attr('key');
                $this.TmpMatrix[$this.ITR_STEP].tmp_matrix.Matrix[$this.current_j][$this.current_i] = $this.Group[i].id;
                $this.LocalCounter -= $this.Group[i].create;
                $('#game-status').empty();
                $this.game_current_block.empty();
                $this.update();
            });
            $this._append_current_block($this.Group[key].id).appendTo(div);
            edt_btn.appendTo(div);
            div.appendTo($('#game-status'));
        }
    },
    update_state: function(e){
        this.CurrentMatrix = this.TmpMatrix[this.ITR_STEP].tmp_matrix;
        var m = mouse_coords(e, this.canvas_elem_local);
        var i = Math.floor((m.x) / 24) ;       
        var j = Math.floor((m.y) / 24) ; 
        this.current_i = i;
        this.current_j = j;
        var current_mt_val = this.TmpMatrix[this.ITR_STEP].tmp_matrix.Matrix[j][i];
        this._append_view(current_mt_val);
        this._append_current_block(current_mt_val);
        this.update();
    },
    update: function(){
        var integrate = this.calculate(this.TmpMatrix[this.ITR_STEP].tmp_matrix);
        $('#integrate').text(integrate);
        $('#count').text(this.LocalCounter);
        $('#itr_l').text(this.ITR_STEP);
        $('#itr').text(this.STEP);
        var offset = this.CurrentMatrix.col_length * this.CurrentMatrix.cell_x_size + 50;
        this.TmpMatrix[this.ITR_STEP].tmp_matrix.drawMatrix(0,  this.context);
        this.EndMatrix.drawMatrix(offset, this.context);
    },
    calculate: function(matrix){
        var lambda_1 = 0;
        var calc_group_current = matrix.calculateGroup();
        var calc_group_end     = this.EndMatrix.calculateGroup();
        for(var i = 0; i < matrix.row_length; i++){
            for(var j = 0; j < matrix.col_length; j++){
                if(matrix.Matrix[i][j] != this.EndMatrix.Matrix[i][j]){
                    lambda_1++;
                }
            }
        }
        var lambda_2 = 0;
        var lambda_3 = 0;
        for(gr in this.Group){
            var current_id = this.Group[gr].id;
            var c_gr = 0;
            var e_gr = 0;
            var c_s = 0;
            var e_s = 0;
            for(var i = 0; i < calc_group_current.length; i++){
                if(calc_group_current[i].id == current_id){
                    c_gr++;
                    c_s += calc_group_current[i].count;
                }}
            c_gr *= this.Group[gr].price;
            c_s *= this.Group[gr].price;
            for(var i = 0; i < calc_group_end.length; i++){
                if(calc_group_end[i].id == current_id){
                     e_gr++;
                     e_s += calc_group_end[i].count;
                 }}
            e_gr *= this.Group[gr].price;
            lambda_2 += Math.abs(c_gr - e_gr);
            e_s *= this.Group[gr].price;
            lambda_3 += Math.abs(e_s - c_s);
        }
        var lambda_4 = 0;
        for(gr in this.Group){
            var cr_0 = 0;
            var cr_1 = 0;
            var current_id = this.Group[gr].id;
            for(var i = 0; i < matrix.row_length; i++){
                for(var j = 0; j < matrix.col_length; j++){
                    if(matrix.Matrix[i][j] == current_id){
                        cr_0 += this.Price.Matrix[i][j] * this.Group[gr].price;
                    }
                    if(this.EndMatrix.Matrix[i][j] == current_id){
                        cr_1 += this.Price.Matrix[i][j] * this.Group[gr].price;
                    }
                }
            }
            lambda_4 += Math.abs(cr_0 - cr_1);
        }
        return lambda_1 + lambda_2 + lambda_3 + lambda_4;

    }
};


function mouse_coords(e, elem) {                  
    var m = [];
    var rect = elem.getBoundingClientRect();
    m.x = e.clientX - rect.left;
    m.y = e.clientY - rect.top;
    return m;
}
function RGBtoHEX(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}



