//Đối tượng validator
function Validator(options) {

    var selectorRules = {};

    //Hàm thực hiện validate
    function validate(inputElement, rule){
        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        var errorMessage;
        //Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        //Lặp qua từng rules và kiểm tra
        //Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value);
            if(errorMessage) break;
        } 
                    if(errorMessage){
                        errorElement.innerText = errorMessage;
                        inputElement.parentElement.classList.add('invalid');
                    }else{
                        errorElement.innerText = '';
                        inputElement.parentElement.classList.remove('invalid');
                    }

                    return !errorMessage;
    }
    //Lấy lement của form cần validate
    var formElemment = document.querySelector(options.form);
        if(formElemment){

            //Khi submit form
            formElemment.onsubmit = function(e){
                e.preventDefault();

                var isFormValid = true; 
                //lặp qua từng rule và validate
                options.rules.forEach(function(rule){
                    var inputElement = formElemment.querySelector(rule.selector);
                    var isValid = validate(inputElement,rule);
                    if(!isValid){
                        isFormValid = false;
                    }
                });

                if(isFormValid){
                    if(typeof options.onSubmit === 'function'){

                        var enableInputs = formElemment.querySelectorAll('[name]');
                        var formValues = Array.from(enableInputs).reduce(function(values,input){
                            return (values[input.name] = input.value) && values;
                        }, {});  

                        options.onSubmit(formValues);
                    }
                }

            }
            //Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input...)
                options.rules.forEach(function(rule){
                
                    //Lưu lại các rules cho mỗi ô input
                    if(Array.isArray(selectorRules[rule.selector])){
                        selectorRules[rule.selector].push(rule.test);
                    }else{
                        selectorRules[rule.selector] = [rule.test];  
                    }

                    var inputElement = formElemment.querySelector(rule.selector);
                    
                if(inputElement){
                    //Xử lý trường hợp blur khỏi input
                    inputElement.onblur = function(){
                        validate(inputElement,rule);
                    }
                    //Xử lý mỗi khi người dùng nhập vào input
                    inputElement.oninput = function(){
                        var errorElement = inputElement.parentElement.querySelector(options.errorSelector);
                        errorElement.innerText = '';
                        inputElement.parentElement.classList.remove('invalid');
                    }
                }
            });
           
        }
    
}

//Định nghĩ rules
//Nguyên tắc rules
//1.Khi có lỗi => trả ra message lỗi
//2.Khi hợp lệ => k trả ra gì (undefined)
Validator.isRequired = function (selector,message) {
    return {
        selector: selector ,
        test : function (value){
            return value.trim()? undefined : message || 'Please enter your name';
        }
    }
}


Validator.isEmail = function (selector,message) {
    return {
        selector: selector ,
        test : function (value){
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Please enter your email';
        }
    }
}

Validator.minLength = function (selector,min) {
    return {
        selector: selector ,
        test : function (value){    
            return value.length >= min ? undefined :`Please fill at least ${min} character`;
        }
    }
}

Validator.isConfirmed = function(selector,getConfirmValue,message){
    return{
        selector: selector,
        test: function(value){
            return value === getConfirmValue() ? undefined : message || 'Input value is incorrect';
        }
    }
}