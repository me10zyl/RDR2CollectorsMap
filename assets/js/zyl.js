var zyl  = {
    valuable : function(){
        return "金币;银币;硬币;美元;鹰币;镍币;分;戒指;耳环;项链;苏格兰;溪梅;十大;加勒比朗姆酒";
    },
    resetInput : function(){
        $(".input-search").val("")
        $(document.querySelector('.input-search')).trigger('input');
        this.save();
    },
    init : function(){
        this.bindEvents();
        this.loadData();
    },
    loadData:function(){
        $(".input-search").val(localStorage['zyl-input']);
        $(document.querySelector('.input-search')).trigger('input');
        $("#hideGottenNumber").val(localStorage['hideGottenNumber']);
    },
    bindEvents: function(){
        $(".input-search,#hideGottenNumber").keyup(function(){
            zyl.save();
        });
    },
    save : function(){
        localStorage['zyl-input'] =  $(".input-search").val();
        localStorage['hideGottenNumber'] = $("#hideGottenNumber").val();
    },
    calcCollected:function(){
        console.log('calcCollected')
        var allCategories = Inventory.getAllCategories();
        $(".menu-option").each(function(e){
            var type = $(this).data('type');
            if(allCategories.indexOf(type) > -1){
                $(this).find("span+.calcAmount").remove();
                $(this).find("span").after("<div style='margin-left: 10px' class='calcAmount'>" + Inventory.getCollectedAmountOfCategory(type) + "/" + Inventory.getTotalSizeOfCategory(type) +  "</div>");
            }
        })
    }
}

window.onload = zyl.init.bind(zyl)