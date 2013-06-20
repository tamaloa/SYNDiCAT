load('application');

before(loadLoan, {
    only: ['show', 'edit', 'contract_state', 'put_contract_state', 'loan_state', 'put_loan_state']
    });

action('new', function () {
    this.title = t('loans.new');
    this.loan = new Loan;
    render();
});

action(function create() {
    var data = req.body.Loan;
    if (data.hasOwnProperty('rate_of_interest')) {
      data.rate_of_interest = data.rate_of_interest.replace(/,/g, '.');
    }

    Loan.create(data, function (err, loan) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: loan && loan.errors || err});
                } else {
                    send({code: 200, data: loan.toObject()});
                }
            });
            format.html(function () {
                if (err) {
                    flash('error', t('loans.cannot_create'));
                    render('new', {
                        loan: loan,
                        title: t('loans.new')
                    });
                } else {
                    flash('info', t('loans.created'));
                    redirect(path_to.loans);
                }
            });
        });
    });
});

action(function index() {
    this.title = t('loans.index');
    Loan.all(function (err, loans) {
        switch (params.format) {
            case "json":
                send({code: 200, data: loans});
                break;
            default:
                render({
                    loans: loans
                });
        }
    });
});

action(function show() {
    this.title = t(['loans.details', this.loan.id]);
    switch(params.format) {
        case "json":
            send({code: 200, data: this.loan});
            break;
        default:
            render();
    }
});

action(function contract_state() {
    this.title = t('loans.contract_state_edit');
    switch(params.format) {
        case "json":
            send(this.loan);
            break;
        default:
            render();
    }
});

action(function put_contract_state() {
    var loan = this.loan;
    this.title = 'Edit loan details';
    if (this.loan.contract_state === null && body.Loan.contract_state === 'sent_to_loaner') {
    } else if (this.loan.contract_state === 'sent_to_loaner' && body.Loan.contract_state === 'signature_received') {
    } else {
      delete body.Loan.contract_state;
    }
    this.loan.updateAttributes(body.Loan, function (err) {
        respondTo(function (format) {
            format.json(function () {
                if (err) {
                    send({code: 500, error: loan && loan.errors || err});
                } else {
                    send({code: 200, data: loan});
                }
            });
            format.html(function () {
                if (!err) {
                    flash('info', 'Loan updated');
                    redirect(path_to.loan(loan));
                } else {
                    flash('error', 'Loan can not be updated');
                    render('contract_state');
                }
            });
        });
    });
});

function loadLoan() {
    Loan.find(params.id || params.loan_id, function (err, loan) {
        if (err || !loan) {
            if (!err && !loan && params.format === 'json') {
                return send({code: 404, error: 'Not found'});
            }
            redirect(path_to.loans);
        } else {
            this.loan = loan;
            next();
        }
    }.bind(this));
}
