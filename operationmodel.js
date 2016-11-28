/**
 *  JSBridgeOperationModel - Model class for JS bridge operation.
 *
 */

function JSBridgeOperationModel () {
    this.operationid = '';
    this.redirecturl = '';
    this.walletid = '';
    this.pwalletweb = '';
    this.pwalletid = '';
    this.status = '';
    this.errormessage = '';
    this.operationname = '';
    this.walletinformation = '{}';
}

/**
 *  This function is responsible to update walletid with passed new walletid. It will update vaule only if new value is not exist in walletid.
 *
 *  @param newWalletid New wallet id to be upadated in existing walletid.
 */
JSBridgeOperationModel.prototype.updateWalletID = function(newWalletid) {
    //Update walletid

    if ( Utils.isEmptyString(this.walletid) ) {
      //Currently no wallet id there is cookie
      this.walletid = newWalletid;
    } else {
      //Wallet id exist in cookie, update it with new one
      // 1. Check if new wallet id already exist in cookie
      if ((this.walletid.indexOf(newWalletid) === -1)) {
        // new wallet does not exist in cookie
        this.walletid = this.walletid + "|" + newWalletid;
      }
    }

    Utils.log('New wallet id to be update in cookie: ' + this.walletid);
};

/**
 *  Converts model object into JSON string to store as cookie.
 *
 */
JSBridgeOperationModel.prototype.cookieJSONString = function() {
    //

    var cookieJSONString = '{"walletid":"' + this.walletid + '", "pwalletid":"' + this.pwalletid  +'", "pwalletweb":"' + this.pwalletweb +'"}';
    return cookieJSONString;
};

/**
 *  Converts model object into redirect URL string.
 *
 */
JSBridgeOperationModel.prototype.redirectURLString = function() {

  //mpmerchant://example.com?walletinformation={walletid: "wallet1|wallet2|wallet3", pwalletid: "wallet1", pwalletweb: "walletweb", status:"",error:"",operationname:"read"}

  if ( !Utils.isEmptyString(this.redirecturl) ) {
    // Base64 decoding of redirect URL.
    var decodedRedirectURL = atob(this.redirecturl);

    var redirectURLString;
    if (this.status === "error"){
      //wallet info 
      var jsonWaletInfo = '{"status":"'+ this.status +'", "errormessage":"'+ this.errormessage +'", "operationname":"' + this.operationname + '", "operationid":"' + this.operationid + '"}';
      var encodedWalletInfo = Utils.encodeJSONString(jsonWaletInfo);
      redirectURLString = decodedRedirectURL + '://' + window.location.hostname + '?walletinformation='+encodedWalletInfo;
    } else {
      //wallet info 
      var jsonWaletInfo = '{"walletid":"' + this.walletid + '", "pwalletid":"' + this.pwalletid  +'", "pwalletweb":"' + this.pwalletweb +'", "status":"'+ this.status +'", "errormessage":"'+ this.errormessage +'", "operationname":"' + this.operationname + '", "operationid":"' + this.operationid + '"}';
      var encodedWalletInfo = Utils.encodeJSONString(jsonWaletInfo);
      redirectURLString = decodedRedirectURL + '://' + window.location.hostname + '?walletinformation='+encodedWalletInfo;
    }

    return redirectURLString;
  } else {
    Utils.log('No redirect URL found');
    return null;
  }
};

/**
 *  Update Model object with given JSON String.
 *
 */
JSBridgeOperationModel.prototype.populateCookieJSONString = function(jsonString) {
    var cookieJSONObject = JSON.parse(jsonString);

    if (cookieJSONObject !== null) {
      this.walletid = cookieJSONObject.walletid;
      this.pwalletweb = cookieJSONObject.pwalletweb;
      this.pwalletid = cookieJSONObject.pwalletid;
    }
};
