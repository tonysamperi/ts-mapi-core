export default function smpMemberOrderingAutofixRule(smpMemberOrderingConfiguration) {
    const classesConfiguration = smpMemberOrderingConfiguration.classes;
    const memberTypes = classesConfiguration.memberTypes;

    return {
        meta: {
            type: "suggestion",
            docs: {
                description: "Automatically sorts safe, alphabetically ordered class members."
            },
            fixable: "code",
            messages: {
                sort: "Sort this class member group alphabetically."
            },
            schema: []
        },
        create(context) {
            const sourceCode = context.sourceCode;

            const getSortableMember = (member) => {
                if (
                    classesConfiguration.order !== "alphabetically" ||
                    member.type !== "MethodDefinition" ||
                    member.decorators?.length ||
                    !["method", "get", "set"].includes(member.kind) ||
                    !["Identifier", "PrivateIdentifier"].includes(member.key.type)
                ) {
                    return undefined;
                }

                const accessibility = member.accessibility ?? "public";
                const scope = member.static ? "static" : "instance";
                const memberType = `${accessibility}-${scope}-${member.kind}`;
                const groupIndex = memberTypes.findIndex((group) =>
                    Array.isArray(group) ? group.includes(memberType) : group === memberType
                );

                if (groupIndex === -1) {
                    return undefined;
                }

                return {groupIndex, member, name: member.key.name};
            };

            const reportIfUnsorted = (group) => {
                if (group.length < 2) {
                    return;
                }

                const sortedGroup = [...group].sort((first, second) =>
                    first.name < second.name ? -1 : first.name > second.name ? 1 : 0
                );

                if (sortedGroup.every(({member}, index) => member === group[index].member)) {
                    return;
                }

                const firstMember = group[0].member;
                const lastMember = group[group.length - 1].member;

                context.report({
                    node: firstMember,
                    messageId: "sort",
                    fix(fixer) {
                        return fixer.replaceTextRange(
                            [group[0].start, lastMember.range[1]],
                            sortedGroup.map(({member, start}) =>
                                sourceCode.text.slice(start, member.range[1])
                            ).join("")
                        );
                    }
                });
            };

            const visitClass = (node) => {
                    let group = [];
                    let previousMemberEnd = node.body.range[0] + 1;

                    node.body.body.forEach((member) => {
                        const sortableMember = getSortableMember(member);

                        if (!sortableMember || (group.length && sortableMember.groupIndex !== group[0].groupIndex)) {
                            reportIfUnsorted(group);
                            group = [];
                        }

                        if (sortableMember) {
                            group.push({...sortableMember, start: previousMemberEnd});
                        }

                        previousMemberEnd = member.range[1];
                    });

                    reportIfUnsorted(group);
            };

            return {
                ClassDeclaration: visitClass,
                ClassExpression: visitClass
            };
        }
    };
}
