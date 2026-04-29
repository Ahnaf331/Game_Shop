import re
from django.core.exceptions import ValidationError


class SequentialPasswordValidator:
    """Rejects passwords with common sequential keyboard runs."""

    SEQUENCES = [
        'abcdefghijklmnopqrstuvwxyz',
        'qwertyuiopasdfghjklzxcvbnm',
        '0123456789',
    ]
    MIN_SEQ_LENGTH = 4

    def validate(self, password, user=None):
        lower = password.lower()
        for seq in self.SEQUENCES:
            for i in range(len(seq) - self.MIN_SEQ_LENGTH + 1):
                chunk = seq[i:i + self.MIN_SEQ_LENGTH]
                if chunk in lower or chunk[::-1] in lower:
                    raise ValidationError(
                        'Password must not contain sequential characters '
                        f'(e.g. "{chunk}").',
                        code='sequential_password',
                    )

    def get_help_text(self):
        return 'Your password must not contain sequential characters like "1234" or "abcd".'


class RepeatedCharsPasswordValidator:
    """Rejects passwords with 4+ identical consecutive characters."""

    def validate(self, password, user=None):
        if re.search(r'(.)\1{3,}', password):
            raise ValidationError(
                'Password must not contain 4 or more repeated characters.',
                code='repeated_chars',
            )

    def get_help_text(self):
        return 'Your password must not contain repeated characters like "aaaa".'
