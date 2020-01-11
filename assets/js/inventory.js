var Inventory = {
  isEnabled: $.cookie('inventory-enabled') == '1',
  isPopupEnabled: $.cookie('inventory-popups-enabled') == '1',
  stackSize: parseInt($.cookie('inventory-stack')) ? parseInt($.cookie('inventory-stack')) : 10,

  init: function () {
    $('#enable-inventory').prop("checked", Inventory.isEnabled);
    $('#enable-inventory-popups').prop("checked", Inventory.isPopupEnabled);
    $('#inventory-stack').val(Inventory.stackSize);
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
      if(marker.amount == 0 && Inventory.getAllCategories().indexOf(marker.category) > -1){
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
      if(Inventory.getTotalSizeOfCategory(v.category) - Inventory.getCollectedAmountOfCategory(v.category) > size){
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
  },

  changeMarkerAmount: function (name, amount) {

    var marker = MapBase.markers.filter(_m => {
      return (_m.text == name || _m.subdata == name);
    });

    $.each(marker, function (key, _m) {

      if (Inventory.isEnabled) {
        _m.amount = parseInt(_m.amount) + amount;

        if (_m.amount >= Inventory.stackSize)
          _m.amount = Inventory.stackSize;

        if (_m.amount < 0)
          _m.amount = 0;
      }

      _m.canCollect = _m.amount < Inventory.stackSize && !_m.isCollected;

      if ((_m.isCollected || _m.amount >= Inventory.stackSize) && _m.day == Cycles.data.cycles[Cycles.data.current][_m.category]) {
        $(`[data-marker=${_m.text}]`).css('opacity', '.35');
        $(`[data-type=${_m.subdata || _m.text}]`).addClass('disabled');
      } else if (_m.day == Cycles.data.cycles[Cycles.data.current][_m.category]) {
        $(`[data-marker=${_m.text}]`).css('opacity', '1');
        $(`[data-type=${_m.subdata || _m.text}]`).removeClass('disabled');
      }

      $(`small[data-item=${name}]`).text(marker[0].amount);
      $(`[data-type=${name}] .counter-number`).text(marker[0].amount);

      //If the category is disabled, no needs to update popup
      if (Layers.itemMarkersLayer.getLayerById(_m.text) != null && _m.day == Cycles.data.cycles[Cycles.data.current][_m.category])
        Layers.itemMarkersLayer.getLayerById(_m.text)._popup.setContent(MapBase.updateMarkerContent(_m));
    });

    if ($("#routes").val() == 1)
      Routes.drawLines();

    MapBase.save();
  }
}