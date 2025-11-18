const data = {
    weeks: {
        start: 36,
        end: 38
    },
    customers: [
        {
            id: 1001,
            name: "Jensen yrkeshögskola Malmö",
            city: "Malmö",
            classes: [
                {
                    id: 1001,
                    name: "SYTEST24",
                    assignments: [
                        {
                            id: 1003,
                            name: "Självledarskap grund",
                            consultant: {
                                id: 1001,
                                name: "Sven Svensson",
                                city: "Malmö"
                            }
                        }
                    ]
                },
                {
                    id: 1002,
                    name: "SYSÄK24",
                    assignments: [
                        {
                            id: 1002,
                            name: "Programmering C# grund",
                            consultant: {
                                id: 1002,
                                name: "Eric Eriksson",
                                city: "Åkarp"
                            }
                        }
                    ]
                }
            ]
        }
    ]
};