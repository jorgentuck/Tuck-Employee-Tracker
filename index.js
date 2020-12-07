const inquirer = require('inquirer');
const cTable = require('console.table');
const connection = require('./connection.js');
const db = require('./db/db.js');

init();

async function init() {
    await inquirer.prompt({
        name: 'initQuestion',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View Employees',
            'View Departments',
            'View Roles',
            'Add Employee',
            'Add Department',
            'Add Role',
            'Update Employees',
            'Update Department',
            'Update Role',
            'Remove Employee',
            'Remove Department',
            'Remove Role',
            'Exit'
        ]
    }).then(function (answer) {
        switch (answer.initQuestion) {
            case 'View Employees':
                viewEmployee();
                break;
            case 'View Departments':
                viewDepartment();
                break;
            case 'View Roles':
                viewRole();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'Update Employees':
                updateEmployeeSelection();
                break;
            case 'Update Department':
                updateDepartment();
                break;
            case 'Update Role':
                updateRole();
                break;
            case 'Remove Employee':
                removeEmployee();
                break;
            case 'Remove Department':
                removeDepartment();
                break;
            case 'Remove Role':
                removeRole();
                break;
            case 'Exit':
                connection.end();
                break;
        }
    });
};

function viewEmployee() {
    inquirer.prompt({
        name: 'viewEmployee',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View All Employees',
            'View All Employees By Role',
            'View All Employees By Department',
            'View All Employees By Manager',
            'exit'
        ]
    }).then(async function (answer) {
        switch (answer.viewEmployee) {
            case 'View All Employees':
                const all = await db.getEmployee('nice')
                console.log('\n');
                console.table(all);
                init();
                break;
            case 'View All Employees By Role':
                empRole();
                break;
            case 'View All Employees By Department':
                empDept();
                break;
            case 'View All Employees By Manager':
                empMgr();
                break;
            case 'back':
                init();
                break;
            case 'exit':
                connection.end();
                break;
        }
    });
};

async function addEmployee() {
    const depts = await db.getDepartments();
    const deptChoices = depts.map(({ id, name }) => ({
        name: name,
        value: id
    }));
    inquirer.prompt([{
        name: 'firstName',
        type: 'input',
        message: 'First name?',
    },
    {
        name: 'lastName',
        type: 'input',
        message: 'Last name?',
    },
    {
        name: 'dept',
        type: 'list',
        message: 'Department?',
        choices: deptChoices,
    }]).then(async function (answer) {
        const roles = await db.getRoles(answer.dept);
        const roleChoices = roles.map(({ title, id }) => ({
            name: title,
            value: id
        }));
        inquirer.prompt({
            name: 'role',
            type: 'list',
            message: 'Role?',
            choices: roleChoices
        }).then(async function (answer2) {
            const mgrs = await db.getManagers(answer2.role);
            const mgrChoices = mgrs.map(({ name, id }) => ({
                name: name,
                value: id
            }));
            inquirer.prompt({
                name: 'mgr',
                type: 'list',
                message: 'Manager?',
                choices: mgrChoices
            }).then(async function (answer3) {
                await db.insertEmp(answer.firstName, answer.lastName, answer2.role, answer3.mgr)
                console.log('\n' + 'New employee added!' + '\n');
                init();
            })
        });
    })
};

function addDepartment() {
    inquirer.prompt({
        name: 'dept',
        type: 'input',
        message: 'Department name?',
    }).then(async function (answer) {
        await db.insertDept(answer.dept);
        console.log('\n' + 'New Department added!' + '\n');
        init();
    })
};

async function addRole() {
    const depts = await db.getDepartments();
    const deptChoices = depts.map(({ id, name }) => ({
        name: name,
        value: id
    }));
    const valSalary = (salary) => {
        if (/^[\d]+$/g.test(salary)) {
            return true;
        } else {
            console.log(` - Please use numbers only`);
            return false;
        }
    };
    inquirer.prompt([{
        name: 'dept',
        type: 'list',
        message: 'Department?',
        choices: deptChoices,
    },
    {
        name: 'title',
        type: 'input',
        message: 'Role name?',
    },
    {
        name: 'salary',
        type: 'input',
        message: 'Salary?',
        validate: (salary) => valSalary(salary)

    }]).then(async function (answer) {
        await db.insertRole(answer.title, answer.salary, answer.dept);
        console.log('\n' + 'New Role added!' + '\n');
        init();
    })
};

async function viewDepartment() {
    const dept = await db.getDepartments()
    console.log('\n');
    console.table(dept);
    init();
};
async function viewRole() {
    const role = await db.getRoles()
    console.log('\n');
    console.table(role);
    init();
};

async function updateEmployeeSelection() {
    inquirer.prompt({
        name: 'find',
        type: 'list',
        message: 'Find Employee to update by:',
        choices: [
            { name: 'All Employees', value: 'all' },
            { name: 'Employees by Department', value: 'dept' },
            { name: 'Employees by Role', value: 'role' },
            { name: 'Employees by Manager', value: 'mgr' },
            { name: 'Employees by Salary', value: 'salary' },
        ]
    }).then(async function (answer) {
        switch (answer.find) {
            case 'all':
                const emp = await db.getEmployee(answer.find);
                const empChoices = emp.map(({ id, first_name, last_name }) => ({
                    name: first_name.concat(' ', last_name),
                    value: id
                }));
                updateEmployee(empChoices);
                break;
            case 'dept':
                const depts = await db.getDepartments();
                const deptChoices = depts.map(({ id, name }) => ({
                    name: name,
                    value: id
                }));
                inquirer.prompt(
                    {
                        name: 'value',
                        type: 'list',
                        message: 'Department?',
                        choices: deptChoices,
                    }
                ).then(async function (answer2) {
                    const emp = await db.getEmployee(answer.find, answer2.value);
                    const empChoices = emp.map(({ id, first_name, last_name }) => ({
                        name: first_name.concat(' ', last_name),
                        value: id
                    }));
                    updateEmployee(empChoices);
                })
                break;
            case 'role':
                const roles = await db.getRoles();
                const roleChoices = roles.map(({ title, id }) => ({
                    name: title,
                    value: id
                }));
                inquirer.prompt(
                    {
                        name: 'value',
                        type: 'list',
                        message: 'Role?',
                        choices: roleChoices,
                    }
                ).then(async function (answer2) {
                    const emp = await db.getEmployee(answer.find, answer2.value);
                    const empChoices = emp.map(({ id, first_name, last_name }) => ({
                        name: first_name.concat(' ', last_name),
                        value: id
                    }));
                    updateEmployee(empChoices);
                })
                break;
            case 'mgr':
                const mgrs = await db.getManagers();
                const mgrChoices = mgrs.map(({ name, id }) => ({
                    name: name,
                    value: id
                }));
                inquirer.prompt(
                    {
                        name: 'value',
                        type: 'list',
                        message: 'Manager?',
                        choices: mgrChoices,
                    }
                ).then(async function (answer2) {
                    const emp = await db.getEmployee(answer.find, answer2.value);
                    const empChoices = emp.map(({ id, first_name, last_name }) => ({
                        name: first_name.concat(' ', last_name),
                        value: id
                    }));
                    updateEmployee(empChoices);
                })
                break;
            case 'salary':
                const salary = await db.getRoles();
                const salaryChoices = salary.map(({ salary, id }) => ({
                    name: salary,
                    value: id
                }));
                inquirer.prompt(
                    {
                        name: 'value',
                        type: 'list',
                        message: 'Salary?',
                        choices: salaryChoices,
                    }
                ).then(async function (answer2) {
                    const emp = await db.getEmployee(answer.find, answer2.value);
                    const empChoices = emp.map(({ id, first_name, last_name }) => ({
                        name: first_name.concat(' ', last_name),
                        value: id
                    }));
                    updateEmployee(empChoices);
                })
                break;
        }
    })
}

function updateEmployee(empSelection) {
    inquirer.prompt([
        {
            name: 'emp',
            type: 'list',
            message: 'Choose Employee to update',
            choices: empSelection
        },
        {
            name: 'update',
            type: 'list',
            message: 'What would you like to update?',
            choices: [
                'Full Name',
                'First Name',
                'Last Name',
                'Role, Department, and Salary',
                'Manager',
                'Back',
                'Exit',
            ]
        }
    ]).then(async function (answer) {
        switch (answer.update) {
            case 'Full Name':
                inquirer.prompt(
                    [
                        {
                            name: 'firstName',
                            type: 'input',
                            message: 'First name?',
                        },
                        {
                            name: 'lastName',
                            type: 'input',
                            message: 'Last name?',
                        }
                    ]
                ).then(async function (answer2) {
                    await db.updateEmp(answer.update, answer2.firstName, answer2.lastName, answer2.role, answer2.mgr, answer.emp);
                    console.log('\n' + `Employee's full name updated!` + '\n');
                    init();
                })
                break;
            case 'First Name':
                inquirer.prompt(
                    {
                        name: 'firstName',
                        type: 'input',
                        message: 'First name?',
                    }
                ).then(async function (answer2) {
                    await db.updateEmp(answer.update, answer2.firstName, answer2.lastName, answer2.role, answer2.mgr, answer.emp);
                    console.log('\n' + `Employee's first name updated!` + '\n');
                    init();
                })
                break;
            case 'Last Name':
                inquirer.prompt(
                    {
                        name: 'lastName',
                        type: 'input',
                        message: 'Last name?',
                    }
                ).then(async function (answer2) {
                    await db.updateEmp(answer.update, answer2.firstName, answer2.lastName, answer2.role, answer2.mgr, answer.emp);
                    console.log('\n' + `Employee's last name updated!` + '\n');
                    init();
                })
                break;
            case 'Role, Department, and Salary':
                const roles = await db.getRoles('mappable');
                const roleChoices = roles.map(({ title, id, name, salary }) => ({
                    name: title.concat(', ', name, ', ', salary),
                    value: id
                }));
                inquirer.prompt({
                    name: 'role',
                    type: 'list',
                    message: 'Role?',
                    choices: roleChoices
                }
                ).then(async function (answer2) {
                    await db.updateEmp(answer.update, answer2.firstName, answer2.lastName, answer2.role, answer2.mgr, answer.emp);
                    console.log('\n' + `Employee's Role updated!` + '\n');
                    init();
                })
                break;
            case 'Manager':
                const mgr = await db.getEmployee('all');
                const mgrChoices = mgr.map(({ id, first_name, last_name }) => ({
                    name: first_name.concat(' ', last_name),
                    value: id
                }));
                inquirer.prompt(
                    {
                        name: 'mgr',
                        type: 'list',
                        message: 'Manager?',
                        choices: mgrChoices,
                    }
                ).then(async function (answer2) {
                    await db.updateEmp(answer.update, answer2.firstName, answer2.lastName, answer2.role, answer2.mgr, answer.emp);
                    console.log('\n' + `Employee's Manager updated!` + '\n');
                    init();
                })
                break;
            case 'Back':
                init();
                break;
            case 'Exit':
                connection.end();
                break;
        }
    })
}

async function updateDepartment() {
    const depts = await db.getDepartments();
    const deptChoices = depts.map(({ id, name }) => ({
        name: name,
        value: id
    }));
    inquirer.prompt([{
        name: 'dept',
        type: 'list',
        message: 'Department to update?',
        choices: deptChoices,
    },
    {
        name: 'deptName',
        type: 'input',
        message: 'New Department name?',
    }]).then(async function (answer) {
        await db.updateDept(answer.deptName, answer.dept);
        console.log('\n' + 'Department Updated!' + '\n');
        init();
    })
};

async function updateRole() {
    const roles = await db.getRoles();
    const roleChoices = roles.map(({ id, title }) => ({
        name: title,
        value: id
    }));
    inquirer.prompt([{
        name: 'role',
        type: 'list',
        message: 'Role to update?',
        choices: roleChoices,
    },
    {
        name: 'roleName',
        type: 'input',
        message: 'New Role name?',
    }]).then(async function (answer) {
        console.log('\n' + 'Role Updated!' + '\n');
        init();
    })
};


async function empRole() {
    const roles = await db.getRoles();
    const roleChoices = roles.map(({ title, id }) => ({
        name: title,
        value: id
    }));
    inquirer.prompt(
        {
            name: 'viewEmpRole',
            type: 'list',
            message: 'Role?',
            choices: roleChoices
        }
    ).then(async function (answer) {
        const empRole = await db.getEmployee('role', answer.viewEmpRole);
        console.log('\n');
        console.table(empRole);
        
        init();
    });
};
async function empDept() {
    const depts = await db.getDepartments();
    const deptChoices = depts.map(({ id, name }) => ({
        name: name,
        value: id
    }));
    inquirer.prompt(
        {
            name: 'viewEmpDept',
            type: 'list',
            message: 'Department?',
            choices: deptChoices
        }
    ).then(async function (answer) {
        const empDept = await db.getEmployee('dept', answer.viewEmpDept);
        console.log('\n');
        console.table(empDept);

        init();
    });
};

async function empMgr() {
    const mgrs = await db.getManagers();
    const mgrChoices = mgrs.map(({ name, id }) => ({
        name: name,
        value: id
    }));
    inquirer.prompt({
        name: 'viewEmpMgr',
        type: 'list',
        message: 'Manager?',
        choices: mgrChoices
    }).then(async function (answer) {
        const empMgr = await db.getEmployee('mgr', answer.viewEmpMgr);
        console.log('\n');
        console.table(empMgr);
        init();
    });
};