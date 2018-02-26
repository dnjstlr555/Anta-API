/*
 * pikachu.js
 * Embed this script on any web page, then type "pikachu" on your keyboard
 * to unleash some lightning.
 *
 * All rights and trademarks for "Pikachu" belong to Nintendo, Inc.
 */
(function(window){

  "use strict";

  var key = [80,73,75,65,67,72,85];
  var ck = 0;
  var max = key.length;

  var pikachu = function() {

    var shock = document.createElement('div');
    var img = new Image;
    img.src = data;
    img.style.width = '250px';
    img.style.height = '149px';
    img.style.transition = '1s all';
    img.style.position = 'fixed';
    img.style.left = 'calc(50% - 125px)';
    img.style.bottom = '-149px';
    img.style.zIndex = 999999;

    document.body.appendChild(img);

    window.setTimeout(function(){
      img.style.bottom = '0px';
    },50);

    window.setTimeout(function(){
      shock.style.width="100%";
      shock.style.height="100%";
      shock.style.left = 0;
      shock.style.top = 0;
      shock.style.position="fixed";
      shock.style.zIndex=9999999;
      shock.style.background = '#fffb95';
      shock.style.opacity = 0;

      document.body.appendChild(shock);

      for ( var x = 0; x<21; x++ ) {
        (function(x){
          window.setTimeout(function(){
            if ( x % 2 === 0 ) {
              shock.style.opacity = 0;
            } else {
              shock.style.opacity = 0.3;
            }
          },x * 25);
        })(x)
      }

    },1500);

    window.setTimeout(function(){
      img.style.bottom = '-149px';
    }, 2300);
    window.setTimeout(function(){
      img.parentNode.removeChild(img);
      shock.parentNode.removeChild(shock);
    }, 3400);

  };

  var record = function(e) {

    if ( e.which === key[ck] ) {
      ck++;
    } else {
      ck = 0;
    }

    if ( ck >= max ) {
      pikachu();
      ck = 0;
    }

  };

  var init = function(data) {

    document.addEventListener('keyup', record);

  };

  var data = 'data:image/gif;base64,'+
    'R0lGODlh9AEqAaIEAPj4ABgYGPgICPj4+P///wAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh'+
    '/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0n77u/JyBpZD0nVzVNME1wQ2VoaUh6cmVTek5U'+
    'Y3prYzlkJz8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0nYWRvYmU6bnM6bWV0YS8nIHg6eG1wdGs9J0lt'+
    'YWdlOjpFeGlmVG9vbCA4LjM1Jz4KPHJkZjpSREYgeG1sbnM6cmRmPSdodHRwOi8vd3d3LnczLm9y'+
    'Zy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjJz4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91'+
    'dD0nJwogIHhtbG5zOnhtcD0naHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyc+CiAgPHhtcDpD'+
    'cmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3M8L3htcDpDcmVhdG9yVG9vbD4K'+
    'IDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1s'+
    'bnM6c3RSZWY9J2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMn'+
    'CiAgeG1sbnM6eG1wTU09J2h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8nPgogIDx4bXBN'+
    'TTpEZXJpdmVkRnJvbSByZGY6cGFyc2VUeXBlPSdSZXNvdXJjZSc+CiAgIDxzdFJlZjpkb2N1bWVu'+
    'dElEPnhtcC5kaWQ6MTQ4MUUxQkZFMkY3MTFERkI5RjVEN0JFRDg5REQzODk8L3N0UmVmOmRvY3Vt'+
    'ZW50SUQ+CiAgIDxzdFJlZjppbnN0YW5jZUlEPnhtcC5paWQ6MTQ4MUUxQkVFMkY3MTFERkI5RjVE'+
    'N0JFRDg5REQzODk8L3N0UmVmOmluc3RhbmNlSUQ+CiAgPC94bXBNTTpEZXJpdmVkRnJvbT4KICA8'+
    'eG1wTU06RG9jdW1lbnRJRD54bXAuZGlkOjE0ODFFMUMxRTJGNzExREZCOUY1RDdCRUQ4OUREMzg5'+
    'PC94bXBNTTpEb2N1bWVudElEPgogIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6MTQ4MUUxQzBF'+
    'MkY3MTFERkI5RjVEN0JFRDg5REQzODk8L3htcE1NOkluc3RhbmNlSUQ+CiA8L3JkZjpEZXNjcmlw'+
    'dGlvbj4KPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg'+
    'ICAKPD94cGFja2V0IGVuZD0ndyc/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e'+
    '3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6al'+
    'pKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1s'+
    'a2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQz'+
    'MjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAkK'+
    'AAQALAAAAAD0ASoBAAP/GLrc/oHISau9OOvNu/9gKI5kaZ5oqq4q5L4Kq8G0I994ru987//AW20Y'+
    '8xGHwaRyyWw6n1DMsfab0qLYrHbL7QatsCrY5S2bz+j0dkw2st9ItXxOr6fg+LA7z2/Y/4CBggR9'+
    'hQtihn2Di4yNWomFiJB4jpWWlz2TfJKabJifoKEknZRKpKc2oqqrpqiuEU+vrqy0tTuyqFC4p7a9'+
    'vne7nbrBmr/GxyDExbHKkMjP0BfNzsyoANfY2drZs9HeaK/b4tvdTuHj6ADl3+xc5+ni60zv8Nry'+
    '7fjD1vXkudWn/PrxykdQH8CA3PyZc4Uw4cCCEJfQQ3jvX6KGGNMZisiR/0OhjCDjTTLTKaTJaxs7'+
    'qpTW5+TJZV5KugSZcqVNCR9n0hxZRqbOhjVvrsz5EyjPmJqKGlUk1CZRpfxgdpkINWOppr/wVHVZ'+
    'MQvVrRThYDWmFWzIrli+mq13daytsmsxoo2iNi66tm5pwbUbcO6apHyh4s3bE05gwVLl+DysczDh'+
    'qYYZ/xRWZ7Hkl2Ifn9l72SRlOpY773yjeXNk0Z4TqwmNeqmn0oXftE59FJCh2WvHSJwWFAgY3Lkj'+
    'OboNfKvuVryZJvld3LjwRsSbKz2+PLnyL1akV+09KLr2xmB2W88j/sj36c8ZeT+P2Ur58aSRm2cP'+
    '/voiwPTRT/kAv/8LD/9j5KcfNdBNIuCARPDn34J+dBDggfURqJ6BEEaYIIAMZgiLR8xV2J6E91Ho'+
    '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';

    init(data);

})(window);