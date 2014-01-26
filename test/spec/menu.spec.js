describe('Menu', function () {

    var menu;

    beforeEach(function () {
        menu = new Menu();
        menu.init();
    });

    it('Should be defined', function () {
        expect(menu).toBeDefined();
    });

    it('Should ensure only 1 cheesecake is available', function () {
        menu.updateAvailability('deserts', 2);
        expect(menu.isAvailable('deserts', 'Cheesecake')).toBe(false);
    });

    it('Should ensure that main course is selected', function () {
        expect(menu.hasMainCourse('1')).toBe(false);

        menu.addToSelection('1', 'mainCourses', {
            name: 'Steak',
            price: 18,
            availability: 10
        });

        expect(menu.hasMainCourse('1')).toBe(true);
    });

    it('Should update the total when a dish is selected', function () {

        menu.addToSelection('1', 'mainCourses', {
            name: 'Vegetarian lasagna',
            price: 12,
            availability: 10
        });

        expect(menu.getTotal('1')).toEqual(12);

        menu.addToSelection('1', 'deserts', {
            name: 'Ice cream',
            price: 3.50,
            availability: 10
        });

        expect(menu.getTotal('1')).toEqual(15.50);
    });

    it('Should ensure you cannot have prawn cocktail and salmon fillet in the same meal', function () {

        menu.addToSelection('1', 'mainCourses', {
            name: 'Salmon fillet',
            price: 14,
            availability: 10
        });

        expect(menu.isValidCombination('1', 'Prawn cocktail')).toBe(false);

        menu.addToSelection('1', 'starters', {
            name: 'Prawn cocktail',
            price: 6,
            availability: 10
        });

        expect(menu.isValidCombination('1', 'Salmon fillet')).toBe(false);
    });

});
