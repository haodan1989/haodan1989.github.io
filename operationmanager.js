
/**
 *  OperationManager - OperationManager is responsible for performing javascript bridge operations.
 *
 */

function OperationManager () {

  /**
   *  Operation model class object, which contains all the required parameters to perform the JS Bridge operation.
   */
  this.operationModel = new JSBridgeOperationModel();

  this.collectCommonQueryParameters();
}

/**
 *  This function decide which javascript bridge operation to perform based on operation name query parameter
 *
 */
OperationManager.prototype.performOperation = function() {

  try {

    switch (this.operationModel.operationname) {
      case "read":{
        this.performRead();
        break;
      }
      case "write": {
        this.performWrite();
        break;
      }
      case "delete": {
        this.performDelete();
        break;
      }
      default:{
        Utils.log('Invalid Operation Name');
        this.operationModel.status = "error";
        this.operationModel.errormessage = "Invalid Operation Name";
        break;
      }
    }

  } catch(error) {
    this.operationModel.status = "error";
    this.operationModel.errormessage = error.message;
  } finally {
    //After operation gets completed, redirect to specified URL
    this.redirectToApplication();
  }
};

/**
 *  This function perform Javascript Bridge Write operation. It will collect values from query parameters and update it into cookie for walletinformation.
 *
 */
OperationManager.prototype.performWrite = function() {
  Utils.log('Write operation')
  //perform write operation

  //Update model class with cookie
  this.updateModelWithStoredCookieValue();

  //Collect wallet parameters
  //get walletid
  if(this.operationModel.walletinformation.hasOwnProperty("walletid")){
    var walletid = this.operationModel.walletinformation["walletid"]
    this.operationModel.updateWalletID(walletid);
  }

  //get preferred walletid
  if(this.operationModel.walletinformation.hasOwnProperty("pwalletid")){
    var pwalletid = this.operationModel.walletinformation["pwalletid"]
    this.operationModel.pwalletid = pwalletid;
  }

  //get preferred web walletid
 if(this.operationModel.walletinformation.hasOwnProperty("pwalletweb")){
    var pwalletweb = this.operationModel.walletinformation["pwalletweb"]
    this.operationModel.pwalletweb = pwalletweb;
  }

  //Updating cookie value
  var cookieString = this.operationModel.cookieJSONString();
  var cookieManager = new CookieManager('walletinformation');
  var result = cookieManager.writeCookie(cookieString);

  if(!result) {
    Utils.log("cookie update fail");
    this.operationModel.status = "error";
    this.operationModel.errormessage = "Cookie write operation failure";
  } else {
    Utils.log("Updated cookie value: " + cookieString);
  }
};

/**
 *  This function perform Javascript Bridge Read operation. It will read cookie value from walletinformation.
 *
 */
OperationManager.prototype.performRead = function(jsonString) {
  //perform javascript read operation
  Utils.log('Read operation');
  this.updateModelWithStoredCookieValue();
};

/**
 *  This function perform Javascript Bridge Delete operation. It will delet cookie value for walletinformation.
 *
 */
OperationManager.prototype.performDelete = function() {
  Utils.log('Delete operation');
  var cookieManager = new CookieManager('walletinformation');
  cookieManager.deleteCookie()
};

/**
 *  This function is responsible for redirection to Aplication
 *
 */
OperationManager.prototype.redirectToApplication = function(jsonString) {
  //perform javascript read operation

  var redirectURL = this.operationModel.redirectURLString();
  if (redirectURL) {
    Utils.log('Redirect URL:-  ' + redirectURL);
    window.location = redirectURL;
  }
};

/**
 *  This function will collect common parameters for JS bridge operation. Also update these parameters into MODEL class object (operationModel).
 *
 */
OperationManager.prototype.collectCommonQueryParameters = function() {
  //Collect query parametrs and store it into appropreate variables

  //Read operationid
 var walletInfo = Utils.getQueryParameterByName("walletinformation");
  if ( !Utils.isEmptyString(walletInfo) ) {
      var walletInfoData = Utils.decodeJSONString(walletInfo);
      if(walletInfoData){
        this.operationModel.walletinformation = walletInfoData;
      }
      else {
        //Operation identifier not found in request URL
        this.operationModel.status = "error";
        this.operationModel.errormessage = "Wallet Information can not be decoded from request";
      }
      //read operation id
      if (!Utils.isEmptyString(walletInfoData["operationid"])) {
         this.operationModel.operationid = walletInfoData["operationid"];
      } else {
        //Operation identifier not found in request URL
        this.operationModel.status = "error";
        this.operationModel.errormessage = "Operation identifier not found in request";
      }

      //read operation name
      if ( !Utils.isEmptyString(walletInfoData["operationname"]) ) {
        this.operationModel.operationname = walletInfoData["operationname"];
      } else {
        //Operation identifier not found in request URL
        this.operationModel.status = "error";
        this.operationModel.errormessage = "Operation name not found in request";
      }
      
      //read redirect url
      if ( !Utils.isEmptyString(walletInfoData["redirecturl"]) ) {
        this.operationModel.redirecturl = walletInfoData["redirecturl"];
      } else {
        //Redirect URL not found in request URL
        this.operationModel.status = "error";
        this.operationModel.errormessage = "Redirect URL not found in request";
      }
  }
  else {
        //Redirect URL not found in request URL
        this.operationModel.status = "error";
        this.operationModel.errormessage = "Wallet Information not found in request";
  }

};

/**
 *  Read cookie value for walletinformation, and update MODEL class object with cookie value.
 *
 */
OperationManager.prototype.updateModelWithStoredCookieValue = function() {
  //Read a cookie from cookie storage and update the cookie model object with stored value
  var cookieManager = new CookieManager('walletinformation');
  var cookieValue = cookieManager.readCookie()

  if (cookieValue !== "" && cookieValue !== null) {
    this.operationModel.populateCookieJSONString(cookieValue);
  }
};



/**
 *  Utils - This class implements utilities function used to perform JS bridge operation.
 *
 */
var Utils = new function() {

  //TODO: This should be true for production environment.

  /**
   *  This veriable should be "true" for production environment and false for development environment.
   *
   */
  this.isProduction = false;

  /**
   *  This function will search the URL query and returns the query parameter value for passed name.
   *
   *  @param name Mandatory. Name of parameter to be searched from URL query
   *  @param url Optional. URL from which query parameters will be fetched. If not passed, function will use current URL.
   */
  this.getQueryParameterByName = function (name, url) {

    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
    results = regex.exec(url);
    if (!results) {
      return null;
    }
    if (!results[2]){
        return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, " "));
  };

  //decode json string
  this.decodeJSONString = function (walletInfo) {
    var decodedString = atob(walletInfo);
    var jsonWalletInfo = JSON.parse(decodedString);
    if (!jsonWalletInfo) 
    {
        return null;
    };
    return jsonWalletInfo;    

  };

  //encode json string
  this.encodeJSONString = function (walletInfo) {
    var encodedString = btoa(walletInfo);
    if (!encodedString) 
    {
        return null;
    };
    return encodedString;    
  };


  /**
   *  Checks whether string is empty or not
   *
   *  @param stringValue
   */
  this.isEmptyString = function (stringValue) {
    if (stringValue !== null && stringValue !== '') {
      return false;
    } else {
      return true;
    }
  };

  /**
   *  Only puts consol log if environment is not production.
   *
   *  @param logString Console log message.
   */
  this.log = function (logString) {
    if(!this.isProduction) {
      console.log(logString);
    }
  };

};


/*
 * This function will be called on page load event.
 */

$(document).ready(function () {
  var operationManager = new OperationManager();
  operationManager.performOperation();
});



/*
 *
 */
function getWalletId() {

  var cookieManager = new CookieManager('walletinformation');
  var cookieValue = cookieManager.readCookie();
  
  console.log("cookieValue is " + cookieValue);
  console.log("cookieValue JSON " + JSON.stringify(cookieValue));
  var walletId = JSON.parse(cookieValue).walletid;
  console.log("walletId is " + walletId);
  return walletId.split("|");
};

/*
 * Test Functions
 */
function testWrite() {
  var cookieValue = prompt("Enter Cookie Walue", "{\"walletid\": \"wallet1|wallet2|wallet3\", \"pwalletid\": \"wallet1\", \"pwalletweb\": \"walletweb\"}");
  if (cookieValue != null) {
    var cookieManager = new CookieManager('walletinformation');
    cookieManager.writeCookie(cookieValue)
  }
};

function testRead() {
  var cookieManager = new CookieManager('walletinformation');
  var cookieVlaue = cookieManager.readCookie()
  alert(cookieVlaue);
};

function testDelete() {
  var cookieManager = new CookieManager('walletinformation');
  cookieManager.deleteCookie()
};
