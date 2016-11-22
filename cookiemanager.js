/**
 *  CookieManager - A small class to manipulate cookies from javascript
 *
 *  @param name Name of cookie to passed to the constructor. Mandatory value.
 *
 */
function CookieManager (name) {
  /**
   *  Cookie name to be set, update and delete
   */
    this.name = name;

    /**
     *  Cookie value to be set or update
     */
    this.value = "";

    /**
     *  This function returns domain name to be stored into cookies
     */
    this.domain = function() {
      return window.location.hostname;
    };

    /**
     *  This function returns secure parameter for cookie
     */
    this.secure = function(){
      return "secure"
    };

    /**
     *  This function returns Cookie path
     */
    this.path = function() {
      return "/";
    };

    /**
     *  This function returns Cookie path
     *
     *  @param years Years after cookies get expired.
     */

    this.expires = function(years) {
      var now = new Date();
      var time = now.getFullYear();
      var expireTime = time + 2;
      now.setFullYear(expireTime);
      return now.toUTCString();
    };
}

/**
 *  This function writes cookie.
 *
 *  @param value Cookie value to be updated.
 *  @param years Years after cookies get expired.
 */

CookieManager.prototype.writeCookie = function(value, years) {
    //Return true for success and false for failure
    if (true === this.isValidCookieName()) {
      var expireTime;

      if (years) {
        expireTime = this.expires(years);
      } else {
        expireTime = this.expires(2);
      }

      var cookieString = this.name + "=" + value + "; domain=" + this.domain() +"; "+ this.secure + "; path=" + this.path() + "; expires=" + expireTime;
      document.cookie = cookieString;
      return true;
    } else {
      return false;
    }
};

/**
 *  This function reads cookie.
 *
 */
CookieManager.prototype.readCookie = function() {
    //Returns cookie value
    var cname = this.name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ')
        c = c.substring(1);
      if (c.indexOf(cname) === 0)
        return c.substring(cname.length, c.length);
    }

    return null;
};

/**
 *  This function delete cookie.
 *
 */
CookieManager.prototype.deleteCookie = function() {
    //Return true for success and false for failure
    return this.writeCookie("",-1);
};

/**
 *  This function validate cookie.
 *
 */
CookieManager.prototype.isValidCookieName = function() {

  if (this.name !== null && this.name !== undefined && this.name !== "")
    return true;
  else
    return false;
};
