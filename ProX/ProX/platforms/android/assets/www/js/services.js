angular.module('app.services', [])

.factory('DataFactory', [function(){
    var array = [
{
    "Q_Number": 1,
    "Q_Text": "Say aaaaa",
    "Q_Audio": "q1.wav",
    "Q_Short":"test1",
    "Q_Nav": "(x)-( )-( )-( )-( )-( )"
},
{
    "Q_Number": 2,
    "Q_Text": "Say Hello World",
    "Q_Audio": "q2.wav",
    "Q_Short": "test2",
    "Q_Nav": "(x)-(x)-( )-( )-( )-( )"
},
{
    "Q_Number": 3,
    "Q_Text": "How much did you drink last night?",
    "Q_Audio": "q3.wav",
    "Q_Short": "test3",
    "Q_Nav": "(x)-(x)-(x)-( )-( )-( )"
},
{
    "Q_Number": 4,
    "Q_Text": "How much did you drink last night?",
    "Q_Audio": "q3.wav",
    "Q_Short": "test4",
    "Q_Nav": "(x)-(x)-(x)-(x)-( )-( )"
},
{
    "Q_Number": 5,
    "Q_Text": "How much did you drink last night?",
    "Q_Audio": "q3.wav",
    "Q_Short": "test5",
    "Q_Nav": "(x)-(x)-(x)-(x)-(x)-( )"
},
{
    "Q_Number": 6,
    "Q_Text": "How much did you drink last night?",
    "Q_Audio": "q3.wav",
    "Q_Short": "test6",
    "Q_Nav": "(x)-(x)-(x)-(x)-(x)-(x)"
}
    ];

    return{
        get: function()
        {return array}
    }
}])

.service('SharedData', [function () {
    var q = 0;

    return {
        getq: function () {
            return q;
        },
        setq: function (value) {
            q = value;
        }
    };

}])


.service('BlankService', [function(){

}]);

