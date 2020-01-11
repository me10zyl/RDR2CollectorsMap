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
        var allCategories = zyl.getAllCategories();
        $(".menu-option").each(function(e){
            var type = $(this).data('type');
            if(allCategories.indexOf(type) > -1){
                $(this).find("span+.calcAmount").remove();
                $(this).find("span").after("<div style='margin-left: 10px' class='calcAmount'>" + zyl.getCollectedAmountOfCategory(type) + "/" + zyl.getTotalSizeOfCategory(type) +  "</div>");
            }
        })
    },
    getTotalSizeOfCategory : function(category){
        return $(".menu-hidden[data-type="+category+"]").find(".collectible-wrapper").length;
    },

    getAllCategories : function(){
        return ['american_flowers','card_cups','card_swords','card_wands', 'card_pentacles', 'lost_bracelet', 'lost_earrings', 'lost_necklaces','lost_ring','antique_bottles', 'bird_eggs','arrowhead','family_heirlooms','coin']
    },

    getCollectedAmountOfCategory : function(category){
        var amount = 0;
        var subdatas = [];
        $.each(MapBase.markers, function(key, marker){
            if(marker.amount > 0 && marker.category == category && subdatas.indexOf(marker.subdata) == -1){

                amount += 1;
                subdatas.push(marker.subdata);
            }
        });
        return amount;
    },

    hideGotten : function(){
        var markerCollected = {

        }
        var size = $("#hideGottenNumber").val() || 3;
        $.each( MapBase.markers, function(key, marker){
            if(marker.amount == 0 && zyl.getAllCategories().indexOf(marker.category) > -1){
                var collectible = marker.subdata || marker.text;
                if(collectible.match('_\d')){
                    return true;
                }
                var category = marker.category;
                var title = marker.title;
                markerCollected[collectible] = marker;
            }
        });
        var titles = [];
        $.each(markerCollected, function(k, v){
            if(zyl.getTotalSizeOfCategory(v.category) - zyl.getCollectedAmountOfCategory(v.category) > size){
                return true;
            }
            var title = v.title;
            if(title.indexOf('#') > -1){
                title = title.substring(0, title.indexOf('#')).trim();
            }
            if(titles.indexOf(title) == -1) {
                titles.push(title);
            }
        });
        $(".input-search").val(titles.join(";"))
        $(document.querySelector('.input-search')).trigger('input');
        zyl.save()
    }
}

window.onload = zyl.init.bind(zyl)