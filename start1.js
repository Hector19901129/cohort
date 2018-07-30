
var file_orders = 'orders.csv';
var file_customers = 'customers.csv';
var weeks = 10;


var content_orders = fs.readFileSync(file_orders, "utf8");
var content_customers = fs.readFileSync(file_customers, "utf8");
var rows_orders, rows_customers;

Papa.parse(content_orders, {
    header: false,
    complete: function(results) {
        rows_orders = results.data;
 
    }
});

Papa.parse(content_customers, {
    header: false,
    complete: function(results) {
        rows_customers = results.data;
    
    }
});

function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }
    return str;
}

var result_array1 = new Array();
var result_array2 = new Array();
var result_customers_array = new Array();
var result_cohort_array = new Array();
var last_date = moment(rows_customers[1][1]);



for(var i =2; i < rows_customers.length - 1; i++){
    last_date = moment.max(last_date, moment(rows_customers[i][1]));
}



var start_date = moment(last_date);
var start_date = start_date.subtract(6,"day");



var cur_index = 0;
for(var i = 0; i < weeks; i++){
    var cur_customers_index = 0;
    var cur_customers = new Array();
    result_cohort_array[i] = String(start_date.get('month') + 1) + "/" 
                    + String(start_date.get('date')) + " - " +
                    String(last_date.get('month') + 1) + "/" 
                    + String(last_date.get('date'));

    result_customers_array[i] = 0;


    for(var j = 1; j < rows_customers.length - 1; j++){

        if(new Date(rows_customers[j][1]).getTime() >= new Date(start_date).getTime() && new Date(rows_customers[j][1]).getTime() <= new Date(last_date).getTime()){
            cur_customers[cur_customers_index] = rows_customers[j][0];
            result_customers_array[i]++;
            cur_customers_index++;
        }
    }


    var start = moment(start_date);
    var last = moment(last_date);


    if(result_customers_array[i] > 0){
        
        for(var k = 0; k <= i; k++){
            var orderers_count = 0;
            var firsttime_count = 0;
            for(var l = 0; l < result_customers_array[i]; l++){
                var firsttime_flag = 0;
                for(var m = 1; m < rows_orders.length - 1; m++){

                    if(rows_orders[m][2] == cur_customers[l] && new Date(rows_orders[m][3]).getTime() >= new Date(start).getTime() && new Date(rows_orders[m][3]).getTime() <= new Date(last).getTime()){
                        firsttime_flag++;
                    }
                }
                if(firsttime_flag == 1) firsttime_count++;
                if(firsttime_flag >= 1) orderers_count++;
            }
            result_array1[cur_index] = String(((orderers_count == 0 ? 0 : orderers_count / result_customers_array[i]) * 100).toFixed(2)) + "% " + "orderers " + "("+ orderers_count +")";
            result_array2[cur_index] = String(((firsttime_count == 0 ? 0 : firsttime_count / result_customers_array[i]) * 100).toFixed(2)) + "% " + "1st time" + " ("+ firsttime_count +")";
            cur_index++;

            start = last.add(1, 'day');
            var temp = moment(start);
            last = temp.add(6, 'day');
        }
    }




    else{
        for(var k = 0; k <= i; k++){
            result_array1[cur_index] = "";
            result_array2[cur_index] = "";
            cur_index++;
        }
    }

    last_date = start_date.subtract(1, 'day');
    var temp = moment(last_date);
    start_date = temp.subtract(6, 'day');
}

var outData = new Array(weeks + 1);
for (var i = 0; i < weeks + 1; i++) {
  outData[i] = new Array(weeks + 2);
}




outData[0][0] = "Cohort";
outData[0][1] = "Customers";
for(var i = 2; i < 2 + weeks; i++){
    outData[0][i] = String((i - 2) * 7) + "-" + String((i - 1) * 7 - 1) + " days";
}
for(var i = 0; i < weeks; i++){
    outData[i + 1][0] = result_cohort_array[i];
    outData[i + 1][1] = result_customers_array[i];
}
var j= 0;
for(var k = 0; k < weeks; k++){
    for(var l = 0; l < weeks; l++){
        if(l <= k){
            outData[k + 1][l + 2] = new Array();
            outData[k + 1][l + 2][0] = result_array1[j];
            outData[k + 1][l + 2][1] = result_array2[j];
            j++;
        }
        

        else{
            outData[k + 1][l + 2] = new Array();
            outData[k + 1][l + 2][0] = "";
            outData[k + 1][l + 2][1] = "";
        }
        
    }
}

console.log(outData);

/*fs.writeFile('result.csv', outData, function(err) {
    if (err) throw err;
    console.log(outData);
});*/







