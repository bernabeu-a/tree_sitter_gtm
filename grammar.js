module.exports = grammar({
    name: 'gtl',
    // extras: $ => [
    //   $.generated_c,
    // ],

    conflicts: $ => [
      [$.identifier_string],
      [$.identifier_string, $.literal_enum],
      [$.gtl_simple_expression],
      [$.gtl_factor],
      [$.gtl_variable],
      [$.literal_char, $.string],
      [$.source_template]

    ],

    extras: $ => [
      $.comment,
      /\s|\\\r?\n/
    ],

    rules: {
      source_file: $ => seq(
        "%",
        repeat(
          $.template
        )
      ),
      // repeat(
      //   seq(
      //     // $.generated_c,
      //     $.template,
      //     // optional($.generated_c)
      //   ),
      // ),

      // template: $ => /%([^%]*)%/,

      template: $ => seq(
        // token("%"),
        $.source_template,
        // token("%"),
      ),

      generated_c: _ => token(/[^%]*/),
      // generated_c: _ => token(/[^%]*[^%]+/),

      // test_c: _ => token(/\%\w*\%[^{}]+/),

      source_template: $ => seq(
          repeat($.gtl_import),
        choice(
          repeat1($.gtl_function),
          repeat1($.gtl_getter),
          repeat1($.gtl_setter)
        )
      ),

      gtl_import: $ => seq(
        'import',
        $.string
      ),

      gtl_getter: $ => seq(
        'getter',
        '@',
        $.identifier_string,
        $.identifier_string,
        $.gtl_argument_list,
        $.identifier_string,
        $.gtl_instruction_list,
        'end',
        'getter'
      ),

      gtl_setter: $ => seq(
        'setter',
        '@',
        $.identifier_string,
        $.identifier_string,
        $.gtl_argument_list,
        $.gtl_instruction_list,
        'end',
        'setter'
      ),

      gtl_argument_list: $ => seq(
        '(',
        optional(
          repeat1(
            $.identifier_string,
            optional(
              ':',
              '@',
              $.identifier_string
            ),
            optional(
              ','
            )
          )
        ),
        ')'
      ),

      gtl_instruction_list: $ => repeat1(
        choice(
          $.gtl_simple_instruction,
          $.gtl_instruction
        )
      ),

      gtl_expression: $ => seq(
        $.gtl_relation_term,
        repeat(
          choice(
            seq(
              '^',
              $.gtl_relation_term
            ),
            seq(
              '|',
              $.gtl_relation_term
            )
          )
        )
      ),

      gtl_relation_term: $ => seq(
        $.gtl_relation_factor,
        repeat(
          seq(
            '&',
            $.gtl_relation_factor
          )
        )
      ),

      gtl_relation_factor: $ => seq(
        $.gtl_simple_expression,
        repeat(
          choice(
            seq(
              '==',
              $.gtl_simple_expression
            ),
            seq(
              '!=',
              $.gtl_simple_expression
            ),
            seq(
              '<=',
              $.gtl_simple_expression
            ),
            seq(
              '>=',
              $.gtl_simple_expression
            ),
            seq(
              '>',
              $.gtl_simple_expression
            ),
            seq(
              '<',
              $.gtl_simple_expression
            )
          )
        )
      ),

      gtl_simple_expression: $ => seq(
        $.gtl_term,
        repeat(
          choice(
            seq(
              '<<',
              $.gtl_term
            ),
            seq(
              '>>',
              $.gtl_term
            ),
            seq(
              '+',
              $.gtl_term
            ),
            seq(
              '.',
              $.gtl_term
            ),
            seq(
              '-',
              $.gtl_term
            )
          )
        )
      ),

      gtl_term: $ => seq(
        $.gtl_factor,
        repeat(
          choice(
            seq(
              '*',
              $.gtl_factor
            ),
            seq(
              '/',
              $.gtl_factor
            ),
            seq(
              'mod',
              $.gtl_factor
            )
          )
        )
      ),

      gtl_factor: $ => choice(
        seq(
          '(',
          $.gtl_expression,
          ')'
        ),
        seq(
          'not',
          $.gtl_factor
        ),
        seq(
          '~',
          $.gtl_factor
        ),
        seq(
          '-',
          $.gtl_factor
        ),
        seq(
          '+',
          $.gtl_factor
        ),
        'yes',
        'no',
        // $.signed_literal_integer_bigint,
        $.literal_double,
        $.string,
        $.literal_char,
        seq(
          '[',
          $.gtl_expression,
          $.identifier_string,
          optional(
            seq(
              ':',
              repeat1(
                seq(
                  $.gtl_expression,
                  optional(
                    ','
                  )
                )
              )
            )
          ),
          ']'
        ),
        seq(
          $.gtl_variable,
          optional(
            seq(
              '(',
              repeat(
                seq(
                  $.gtl_expression,
                  ','
                )
              ),
              ')'
            )
          )
        ),
        seq(
          'exist',
          $.gtl_variable,
          optional(
            seq(
              'default',
              '(',
              $.gtl_expression,
              ')'
            )
          )
        ),
        seq(
          'typeof',
          $.gtl_variable
        ),
        'true',
        'false',
        $.literal_enum,
        seq(
          '@',
          $.identifier_string
        ),
        'emptylist',
        'emptymap',
        seq(
          'mapof',
          $.gtl_expression,
          choice(
            'end',
            seq(
              'by',
              $.identifier_string
            )
          )
        ),
        seq(
          'listof',
          $.gtl_expression,
          'end'
        ),
        seq(
          '@(',
          repeat(
            seq(
              $.gtl_expression,
              optional(
                ','
              )
            )
          ),
          ')'
        ),
        seq(
          '@[',
          repeat(
            seq(
              $.string,
              ':',
              $.gtl_expression,
              optional(
                ','
              )
            )
          ),
          ']'
        ),
        seq(
          '@{',
          repeat(
            seq(
              $.identifier_string,
              ':',
              $.gtl_expression,
              optional(
                ','
              )
            )
          ),
          '}'
        ),
        seq(
          '@!',
          repeat(
            seq(
              $.gtl_expression,
              optional(
                ','
              )
            )
          ),
          '!'
        ),
        seq(
          '@?',
          $.gtl_expression,
          '?'
        ),
        '__VARS__'
      ),

      gtl_variable: $ => seq(
        $.identifier_string,
        choice(
          optional(
            seq(
              '::',
              $.gtl_variable
            )
          ),
          optional(
            seq(
              '[',
              $.gtl_expression,
              ']',
              optional(
                repeat1(
                  seq(
                    '[',
                    $.gtl_expression,
                    ']'
                  )
                )
              )
            ),
          )
        )
      ),

      literal_enum: _ => repeat1(/[A-Za-z0-9_]/),
      literal_double: _ => {
        const separator = '\'';
        const hex = /[0-9a-fA-F]/;
        const decimal = /[0-9]/;
        const hexDigits = seq(repeat1(hex), repeat(seq(separator, repeat1(hex))));
        const decimalDigits = seq(repeat1(decimal), repeat(seq(separator, repeat1(decimal))));
        return token(seq(
          optional(/[-\+]/),
          optional(choice(/0[xX]/, /0[bB]/)),
          choice(
            seq(
              choice(
                decimalDigits,
                seq(/0[bB]/, decimalDigits),
                seq(/0[xX]/, hexDigits),
              ),
                optional(seq('.', optional(hexDigits))),
            ),
            seq('.', decimalDigits),
          ),
          optional(seq(
            /[eEpP]/,
            optional(seq(
              optional(/[-\+]/),
              hexDigits,
            )),
          )),
          /[uUlLwWfFbBdD]*/,
        ));
    },

      literal_char: $ => seq(
        choice('L\'', 'u\'', 'U\'', 'u8\'', '\''),
        repeat1(
          choice(
            $.escape_sequence,
            token.immediate(/[^\n']/)
          )
        )
      ),

      gtl_variable_or_here: $ => choice(
        'here',
        $.gtl_variable
      ),

      gtl_simple_instruction: $ => choice(
        $.gtl_let_simple_instruction,
        $.gtl_unlet_simple_instruction,
        $.gtl_error_simple_instruction,
        $.gtl_warning_simple_instruction,
        $.gtl_print_simple_instruction,
        $.gtl_println_simple_instruction,
        $.gtl_seed_simple_instruction,
        $.gtl_display_simple_instruction,
        $.gtl_sort_simple_instruction,
        $.gtl_tab_simple_instruction,
        $.gtl_variables_simple_instruction,
        $.gtl_librairies_simple_instruction,
        $.gtl_brackets_simple_instruction
      ),

      gtl_let_simple_instruction: $ => seq(
        'let',
        $.gtl_variable,
        choice(
          seq(
            ':=',
            $.gtl_expression
          ),
          seq(
            '+=',
            $.gtl_expression
          ),
          seq(
            '-=',
            $.gtl_expression
          ),
          seq(
            '*=',
            $.gtl_expression
          ),
          seq(
            '/=',
            $.gtl_expression
          ),
          seq(
            'mod=',
            $.gtl_expression
          ),
          seq(
            '<<=',
            $.gtl_expression
          ),
          seq(
            '>>=',
            $.gtl_expression
          ),
          seq(
            '&=',
            $.gtl_expression
          ),
          seq(
            '|=',
            $.gtl_expression
          ),
          seq(
            '^=',
            $.gtl_expression
          )
        )
      ),

      gtl_unlet_simple_instruction: $ => seq(
        'unlet',
        $.gtl_variable
      ),

      gtl_error_simple_instruction: $ => seq(
        'error',
        $.gtl_variable_or_here,
        ':',
        $.gtl_expression
      ),

      gtl_warning_simple_instruction: $ => seq(
        'warning',
        $.gtl_variable_or_here,
        ':',
        $.gtl_expression
      ),

      gtl_print_simple_instruction: $ => seq(
        'print',
        $.gtl_expression
      ),

      gtl_println_simple_instruction: $ => seq(
        'println',
        optional(
          $.gtl_expression
        )
      ),

      gtl_seed_simple_instruction: $ => seq(
        'seed',
        optional(
          $.gtl_expression
        )
      ),

      gtl_display_simple_instruction: $ => seq(
        'display',
        $.gtl_variable
      ),

      gtl_sort_simple_instruction: $ => seq(
        'sort',
        $.gtl_variable,
        choice(
          $.gtl_sorting_order,
          seq(
            'by',
            repeat1(
              seq(
                $.identifier_string,
                $.gtl_sorting_order,
                optional(',')
              )
            )
          )
        )
      ),

      gtl_tab_simple_instruction: $ => seq(
        'tab',
        $.gtl_expression
      ),

      gtl_variables_simple_instruction: $ => (
        'variables'
      ),

      gtl_librairies_simple_instruction: $ => (
        'librairies'
      ),

      gtl_brackets_simple_instruction: $ => seq(
        '[!',
        $.gtl_variable,
        $.identifier_string,
        optional(
          seq(
            ':',
            repeat1(
              seq(
                $.gtl_expression,
                optional(
                  ','
                )
              )
            )
          )
        ),
        ']'
      ),

      gtl_sorting_order: $ => choice(
        '<',
        '>'
      ),

      gtl_instruction: $ => choice(
        $.gtl_if_instruction,
        $.gtl_foreach_instruction,
        $.gtl_for_instruction,
        $.gtl_loop_instruction,
        $.gtl_repeat_instruction
      ),

      gtl_if_instruction: $ => seq(
        'if',
        seq(
          $.gtl_expression,
          'then',
          $.gtl_instruction_list
        ),
        choice(
          repeat(
            seq(
              'elsif',
              $.gtl_expression,
              'then',
              $.gtl_instruction_list
            )
          ),
          repeat(
            seq(
              'else',
              $.gtl_instruction_list
            )
          )
        ),
        'end',
        'if'
      ),

      gtl_foreach_instruction: $ => seq(
        'foreach',
        $.identifier_string,
        optional(
          seq(
            ',',
            $.identifier_string
          )
        ),
        optional(
          seq(
            '(',
            $.identifier_string,
            ')'
          )
        ),
        'in',
        $.gtl_expression,
        optional(
          seq(
            'before',
            $.gtl_instruction_list
          )
        ),
        'do',
        $.gtl_instruction_list,
        optional(
          seq(
            'between',
            $.gtl_instruction_list
          )
        ),
        optional(
          seq(
            'after',
            $.gtl_instruction_list
          )
        ),
        'end',
        'foreach'
      ),

      gtl_for_instruction: $ => seq(
        'for',
        $.identifier_string,
        'in',
        repeat1(
          seq(
            $.gtl_expression,
            optional(',')
          )
        ),
        'do',
        $.gtl_instruction_list,
        optional(
          seq(
            'between',
            $.gtl_instruction_list
          )
        ),
        'end',
        'for'
      ),

      gtl_loop_instruction: $ => seq(
        'loop',
        $.identifier_string,
        'in',
        $.gtl_expression,
        optional(
          choice(
            'up',
            'down'
          )
        ),
        'to',
        $.gtl_expression,
        optional(
          seq(
            'step',
            $.gtl_expression
          )
        ),
        optional(
          seq(
            'before',
            $.gtl_instruction_list
          )
        ),
        'do',
        $.gtl_instruction_list,
        optional(
          seq(
            'between',
            $.gtl_instruction_list
          )
        ),
        optional(
          seq(
            'after',
            $.gtl_instruction_list
          )
        ),
        'end',
        'loop'
      ),

      gtl_repeat_instruction: $ => seq(
        'repeat',
        optional(
          seq(
            '(',
            $.gtl_expression,
            ')'
          )
        ),
        $.gtl_instruction_list,
        'while',
        $.gtl_expression,
        'do',
        $.gtl_instruction_list,
        'end',
        'repeat'
      ),

      identifier_string: _ => repeat1(/[A-Za-z0-9_]/),

      string: $ => choice(
            seq(
              '"',
              repeat(choice(
                alias($.unescaped_double_string_fragment, $.string_fragment),
                $.escape_sequence,
              )),
              '"',
            ),
            seq(
              '\'',
              repeat(choice(
                alias($.unescaped_single_string_fragment, $.string_fragment),
                $.escape_sequence,
              )),
              '\'',
            ),
          ),

      unescaped_double_string_fragment: _ => token.immediate(prec(1, /[^"\\\r\n]+/)),

      unescaped_single_string_fragment: _ => token.immediate(prec(1, /[^'\\\r\n]+/)),
      escape_sequence: _ => token.immediate(
        seq(
            '\\',
            choice(
              /[^xu0-7]/,
              /[0-7]{1,3}/,
              /x[0-9a-fA-F]{2}/,
              /u[0-9a-fA-F]{4}/,
              /u{[0-9a-fA-F]+}/,
              /[\r?][\n\u2028\u2029]/,
            ),
        )
      ),

      gtl_function: $ => seq(
        'func',
        $.identifier_string,
        $.gtl_argument_list,
        $.identifier_string,
        $.gtl_instruction_list,
        'end',
        'func'
      ),

      gtl_argument_list: $ => seq(
        '(',
        repeat(
          seq(
            $.identifier_string,
            optional(
              seq(
                ':',
                '@',
                $.identifier_string
              ),
            ),
            optional(
              ','
            )
          ),
        ),
        ')'
      ),

      comment: _ => token(
          seq(
            '#',
            /.*/
          )
      )
  }
});
