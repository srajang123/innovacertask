document.querySelector('#checkin').onclick = () => {
    location.href = '/guest';
}
document.querySelector('#checkout').onclick = () => {
    location.href = '/checkout';
}
document.querySelector('#host').onclick = () => {
    location.href = '/host';
}
document.querySelector('#guest').onclick = () => {
        document.querySelector('#checkin').style.visibility = "visible";
        document.querySelector('#checkout').style.visibility = "visible";
        let guest = document.querySelector('#guest');
        let host = document.querySelector('#host');
        host.parentElement.removeChild(host);
        guest.parentElement.removeChild(guest);
        if (window.matchMedia('(max-width:768px)').matches) {
            document.querySelector('#checkin').style.marginTop = "-15%";
            document.querySelector('#checkout').style.marginTop = "-80%";
        } else {
            document.querySelector('#checkin').style.marginTop = "-15%";
            document.querySelector('#checkout').style.marginTop = "-15%";
        }
    }
    (function($) {
        "use strict";


        /*==================================================================
        [ Validate ]*/
        var name = $('.validate-input input[name="name"]');
        var email = $('.validate-input input[name="email"]');
        var subject = $('.validate-input input[name="subject"]');
        var message = $('.validate-input textarea[name="message"]');


        $('.validate-form').on('submit', function() {
            var check = true;

            if ($(name).val().trim() == '') {
                showValidate(name);
                check = false;
            }

            if ($(subject).val().trim() == '') {
                showValidate(subject);
                check = false;
            }


            if ($(email).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                showValidate(email);
                check = false;
            }

            if ($(message).val().trim() == '') {
                showValidate(message);
                check = false;
            }

            return check;
        });


        $('.validate-form .input1').each(function() {
            $(this).focus(function() {
                hideValidate(this);
            });
        });

        function showValidate(input) {
            var thisAlert = $(input).parent();

            $(thisAlert).addClass('alert-validate');
        }

        function hideValidate(input) {
            var thisAlert = $(input).parent();

            $(thisAlert).removeClass('alert-validate');
        }



    })(jQuery);