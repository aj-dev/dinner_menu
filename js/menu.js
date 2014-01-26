var Menu = function () {

    this.starters = [
        {
            name: 'Soup of the day',
            price: 3,
            availability: 10
        },
        {
            name: 'Pâté',
            price: 5,
            availability: 10
        },
        {
            name: 'Bruschetta',
            price: 4.50,
            availability: 10
        },
        {
            name: 'Prawn cocktail',
            price: 6,
            availability: 10
        }
    ];

    this.mainCourses = [
        {
            name: 'Steak',
            price: 18,
            availability: 10
        },
        {
            name: 'Meatballs',
            price: 11.50,
            availability: 10
        },
        {
            name: 'Salmon fillet',
            price: 14,
            availability: 10
        },
        {
            name: 'Vegetarian lasagna',
            price: 12,
            availability: 10
        }
    ];

    this.deserts = [
        {
            name: 'Sticky toffee pudding',
            price: 4,
            availability: 10
        },
        {
            name: 'Tiramisu',
            price: 4.50,
            availability: 10
        },
        {
            name: 'Cheesecake',
            price: 4,
            availability: 1
        },
        {
            name: 'Ice cream',
            price: 3.50,
            availability: 10
        }
    ];

    this.excludedCombinations = [
        {
            starters: 'Prawn cocktail',
            mainCourses: 'Salmon fillet'
        }
    ];

    this.containerIds = ['user-1', 'user-2'];

    this.users = {
        '1': {
            mainCourses: {},
            deserts: {},
            starters: {}
        },
        '2': {
            mainCourses: {},
            deserts: {},
            starters: {}
        }
    };
};

Menu.prototype = {

    init: function (config) {
        _.extend(this, config);
        this.buildMenu();
        this.bindEvents();
    },

    buildMenu: function () {
        var _this = this;

        _.each(this.containerIds, function (id) {
            $('#' + id).find('.starter').append(_this.createOptions('starters'));
            $('#' + id).find('.mainCourse').append(_this.createOptions('mainCourses'));
            $('#' + id).find('.desert').append(_this.createOptions('deserts'));
        });
    },

    createOptions: function (type) {
        var options = '';
        _.each(this[type], function (course) {
            options += ['<option value="', course.name, '">', course.name, ' &pound;', course.price, '</option>'].join('');
        });
        return options;
    },

    bindEvents: function () {
        var _this = this;

        _.each(this.containerIds, function (id) {

            $('#' + id).on('change', '.starter', function (event) {
                _this.getCourse('starters', event);
            });

            $('#' + id).on('change', '.mainCourse', function (event) {
                _this.getCourse('mainCourses', event);
            });

            $('#' + id).on('change', '.desert', function (event) {
                _this.getCourse('deserts', event);
            });

            $('#' + id).on('click', '.confirm', function (event) {
                _this.confirmSelection(id, event);
            });
        });
    },

    getCourse: function (type, event) {
        var name = $(event.target).find('option:selected').val(),
            user = $(event.target).parents('.user'),
            userId = user.attr('id').split('-')[1],
            selectedDish = _.find(this[type], {name: name}),
            selectedDishIndex = _.findIndex(this[type], {name: name}),
            isSelected = this.isSelected(userId, type, name),
            isValid = this.isValidCombination(userId, name),
            isAvailable = name ? this.isAvailable(type, name) : true;

        if (name && !isSelected && isValid && isAvailable) {
            this.addToSelection(userId, type, selectedDish);
            this.setError('', user);
            this.updateTotal(user);
            this.updateAvailability(type, selectedDishIndex);
            this.showSelected(user);
        } else if (isSelected) {
            this.setError('Cannot have more than one of the same course: ' + name, user);
        } else if (!isValid) {
            this.setError('Cannot have prawn cocktail and salmon fillet in the same meal', user);
        } else if (!isAvailable) {
            this.setError('There is no ' + name + ' left', user);
        } else {
            this.users[userId][type] = {};
            this.updateTotal(user);
            this.showSelected(user);
        }
    },

    addToSelection: function (userId, type, selected) {
        this.users[userId][type] = selected;
    },

    isSelected: function (userId, type, name) {
        return _.some(this.users[userId][type], {name: name});
    },

    isValidCombination: function (userId, name) {

        if ((name === 'Prawn cocktail' && this.users[userId].mainCourses.name === 'Salmon fillet') || (name === 'Salmon fillet' && this.users[userId].starters.name === 'Prawn cocktail')) {

            $('#user-' + userId).find('.confirm').attr('disabled', true);

            return false;
        }

        $('#user-' + userId).find('.confirm').attr('disabled', false);

        return true;
    },

    isAvailable: function (type, name) {
        return _.some(this[type], function (course) {
            return course.name === name && !!course.availability;
        });
    },

    isMinimumSelected: function (userId) {
        var count = 0;

        _.each(this.users[userId], function (course) {
            if (!_.isEmpty(course)) {
                count++;
            }
        });

        return count >= 2;
    },

    hasMainCourse: function (userId) {
        return !_.isEmpty(this.users[userId].mainCourses);
    },

    updateAvailability: function (type, index) {
        this[type][index].availability--;
    },

    updateTotal: function (user) {
        var userId = user.attr('id').split('-')[1];

        user.find('.total').text('Total: £' + this.getTotal(userId));
    },

    getTotal: function (userId) {
        var totalPrice = 0;

        _.each(this.users[userId], function (course) {
            if (!_.isEmpty(course)) {
                totalPrice += course.price;
            }
        });

        return totalPrice;
    },

    showSelected: function (user) {
        var listElems = '',
            userId = user.attr('id').split('-')[1];

        _.each(this.users[userId], function (course) {
            if (!_.isEmpty(course)) {
                listElems += '<li>' + course.name + ' £' + course.price + '</li>';
            }
        });

        user.find('.selected').html(listElems);
    },

    confirmSelection: function (id) {

        var userId = id.split('-')[1],
            isMinimumTwo = this.isMinimumSelected(userId),
            hasMainSelected = this.hasMainCourse(userId);

        if (!isMinimumTwo || !hasMainSelected) {

            this.setError('Must have at least two courses, one of which must be a main', $('#' + id));

        } else {

            $('#' + id).find('.select').attr('disabled', true);
            $('#' + id).find('.info').text('Selection Confirmed!');
        }
    },

    setError: function (message, user) {
        user.find('.error').text(message);
    }
};

$(document).ready(function () {
    var menu = new Menu();
    menu.init();
});
